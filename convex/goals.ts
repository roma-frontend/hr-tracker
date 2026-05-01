import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

// Helper: compute KR completion percentage respecting direction
function computeKRProgress(
  startValue: number,
  targetValue: number,
  currentValue: number,
  direction: 'increase' | 'decrease',
  metricType: string
): number {
  if (metricType === 'boolean') {
    return currentValue >= 1 ? 100 : 0;
  }
  const range = direction === 'increase'
    ? targetValue - startValue
    : startValue - targetValue;
  if (range === 0) return currentValue === targetValue ? 100 : 0;
  const progress = direction === 'increase'
    ? currentValue - startValue
    : startValue - currentValue;
  return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
}

// Helper: compute objective progress from weighted KRs
function computeObjectiveProgress(
  keyResults: Array<{
    startValue: number;
    targetValue: number;
    currentValue: number;
    direction: 'increase' | 'decrease';
    metricType: string;
    weight: number;
  }>
): number {
  if (keyResults.length === 0) return 0;
  const totalWeight = keyResults.reduce((sum, kr) => sum + kr.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = keyResults.reduce((sum, kr) => {
    const krProgress = computeKRProgress(
      kr.startValue,
      kr.targetValue,
      kr.currentValue,
      kr.direction,
      kr.metricType
    );
    return sum + krProgress * (kr.weight / totalWeight);
  }, 0);
  return Math.round(weightedSum);
}

// ============ QUERIES ============

export const listObjectives = query({
  args: {
    organizationId: v.id('organizations'),
    periodYear: v.optional(v.number()),
    periodType: v.optional(v.string()),
    level: v.optional(v.string()),
    ownerId: v.optional(v.id('users')),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { organizationId, periodYear, periodType, level, ownerId, status }) => {
    let objectives = await ctx.db
      .query('objectives')
      .withIndex('by_org', (q) => q.eq('organizationId', organizationId))
      .collect();

    if (periodYear) objectives = objectives.filter((o) => o.periodYear === periodYear);
    if (periodType) objectives = objectives.filter((o) => o.periodType === periodType);
    if (level) objectives = objectives.filter((o) => o.level === level);
    if (ownerId) objectives = objectives.filter((o) => o.ownerId === ownerId);
    if (status) objectives = objectives.filter((o) => o.status === status);

    // Fetch owner names
    const enriched = await Promise.all(
      objectives.map(async (obj) => {
        const owner = await ctx.db.get(obj.ownerId);
        const krs = await ctx.db
          .query('keyResults')
          .withIndex('by_objective', (q) => q.eq('objectiveId', obj._id))
          .collect();
        return {
          ...obj,
          ownerName: owner?.name ?? 'Unknown',
          ownerAvatar: owner?.avatarUrl,
          keyResultsCount: krs.length,
          keyResults: krs,
        };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getObjective = query({
  args: { objectiveId: v.id('objectives') },
  handler: async (ctx, { objectiveId }) => {
    const obj = await ctx.db.get(objectiveId);
    if (!obj) return null;

    const owner = await ctx.db.get(obj.ownerId);
    const krs = await ctx.db
      .query('keyResults')
      .withIndex('by_objective_order', (q) => q.eq('objectiveId', objectiveId))
      .collect();

    const krsWithCheckins = await Promise.all(
      krs.map(async (kr) => {
        const checkins = await ctx.db
          .query('goalCheckins')
          .withIndex('by_kr', (q) => q.eq('keyResultId', kr._id))
          .collect();
        const krOwner = await ctx.db.get(kr.ownerId);
        return {
          ...kr,
          ownerName: krOwner?.name ?? 'Unknown',
          checkins: checkins.sort((a, b) => b.createdAt - a.createdAt),
          completionPercent: computeKRProgress(
            kr.startValue,
            kr.targetValue,
            kr.currentValue,
            kr.direction,
            kr.metricType
          ),
        };
      })
    );

    // Children (aligned objectives)
    const children = await ctx.db
      .query('objectives')
      .withIndex('by_parent', (q) => q.eq('parentObjectiveId', objectiveId))
      .collect();

    return {
      ...obj,
      ownerName: owner?.name ?? 'Unknown',
      ownerAvatar: owner?.avatarUrl,
      keyResults: krsWithCheckins,
      children,
    };
  },
});

export const getMyObjectives = query({
  args: {
    organizationId: v.id('organizations'),
    userId: v.id('users'),
  },
  handler: async (ctx, { organizationId, userId }) => {
    const objectives = await ctx.db
      .query('objectives')
      .withIndex('by_org_owner', (q) =>
        q.eq('organizationId', organizationId).eq('ownerId', userId)
      )
      .collect();

    const enriched = await Promise.all(
      objectives.map(async (obj) => {
        const krs = await ctx.db
          .query('keyResults')
          .withIndex('by_objective', (q) => q.eq('objectiveId', obj._id))
          .collect();
        return { ...obj, keyResults: krs, keyResultsCount: krs.length };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getTeamProgress = query({
  args: {
    organizationId: v.id('organizations'),
    periodYear: v.number(),
    periodType: v.optional(v.string()),
  },
  handler: async (ctx, { organizationId, periodYear, periodType }) => {
    let objectives = await ctx.db
      .query('objectives')
      .withIndex('by_org_period', (q) =>
        q.eq('organizationId', organizationId).eq('periodYear', periodYear)
      )
      .collect();

    if (periodType) objectives = objectives.filter((o) => o.periodType === periodType);

    const active = objectives.filter((o) => o.status === 'active' || o.status === 'completed');
    const avgProgress =
      active.length > 0
        ? Math.round(active.reduce((s, o) => s + o.progress, 0) / active.length)
        : 0;

    const onTrack = active.filter((o) => o.progress >= 60).length;
    const atRisk = active.filter((o) => o.progress >= 30 && o.progress < 60).length;
    const behind = active.filter((o) => o.progress < 30).length;

    return {
      total: objectives.length,
      active: active.length,
      avgProgress,
      onTrack,
      atRisk,
      behind,
      completed: objectives.filter((o) => o.status === 'completed').length,
      byLevel: {
        company: objectives.filter((o) => o.level === 'company').length,
        team: objectives.filter((o) => o.level === 'team').length,
        individual: objectives.filter((o) => o.level === 'individual').length,
      },
    };
  },
});

export const getCheckinHistory = query({
  args: { keyResultId: v.id('keyResults') },
  handler: async (ctx, { keyResultId }) => {
    const checkins = await ctx.db
      .query('goalCheckins')
      .withIndex('by_kr', (q) => q.eq('keyResultId', keyResultId))
      .collect();

    const enriched = await Promise.all(
      checkins.map(async (c) => {
        const user = await ctx.db.get(c.userId);
        return { ...c, userName: user?.name ?? 'Unknown' };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ============ MUTATIONS ============

export const createObjective = mutation({
  args: {
    organizationId: v.id('organizations'),
    title: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id('users'),
    level: v.union(v.literal('company'), v.literal('team'), v.literal('individual')),
    department: v.optional(v.string()),
    periodType: v.union(
      v.literal('Q1'),
      v.literal('Q2'),
      v.literal('Q3'),
      v.literal('Q4'),
      v.literal('H1'),
      v.literal('H2'),
      v.literal('FY'),
    ),
    periodYear: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    parentObjectiveId: v.optional(v.id('objectives')),
    createdBy: v.id('users'),
    keyResults: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        metricType: v.union(
          v.literal('percentage'),
          v.literal('number'),
          v.literal('currency'),
          v.literal('boolean'),
        ),
        direction: v.union(v.literal('increase'), v.literal('decrease')),
        startValue: v.number(),
        targetValue: v.number(),
        unit: v.optional(v.string()),
        weight: v.number(),
        ownerId: v.optional(v.id('users')),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { keyResults, ...objectiveData } = args;

    // Validate parent objective belongs to same org
    if (objectiveData.parentObjectiveId) {
      const parent = await ctx.db.get(objectiveData.parentObjectiveId);
      if (!parent || parent.organizationId !== objectiveData.organizationId) {
        throw new Error('Invalid parent objective');
      }
    }

    // Validate team-level has department
    if (objectiveData.level === 'team' && !objectiveData.department) {
      throw new Error('Team-level objectives require a department');
    }

    const now = Date.now();
    const objectiveId = await ctx.db.insert('objectives', {
      ...objectiveData,
      status: 'active',
      progress: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Create key results
    for (let i = 0; i < keyResults.length; i++) {
      const kr = keyResults[i]!;
      await ctx.db.insert('keyResults', {
        objectiveId,
        organizationId: objectiveData.organizationId,
        title: kr.title,
        description: kr.description,
        metricType: kr.metricType,
        direction: kr.direction,
        startValue: kr.startValue,
        targetValue: kr.targetValue,
        currentValue: kr.startValue,
        unit: kr.unit,
        weight: kr.weight,
        confidence: 'none',
        order: i,
        ownerId: kr.ownerId ?? objectiveData.ownerId,
        createdAt: now,
        updatedAt: now,
      });
    }

    return objectiveId;
  },
});

export const updateObjective = mutation({
  args: {
    objectiveId: v.id('objectives'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('active'),
        v.literal('completed'),
        v.literal('cancelled'),
      )
    ),
  },
  handler: async (ctx, { objectiveId, ...updates }) => {
    const obj = await ctx.db.get(objectiveId);
    if (!obj) throw new Error('Objective not found');

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.status !== undefined) patch.status = updates.status;

    await ctx.db.patch(objectiveId, patch);
  },
});

export const deleteObjective = mutation({
  args: { objectiveId: v.id('objectives') },
  handler: async (ctx, { objectiveId }) => {
    const obj = await ctx.db.get(objectiveId);
    if (!obj) throw new Error('Objective not found');

    // Check no children aligned
    const children = await ctx.db
      .query('objectives')
      .withIndex('by_parent', (q) => q.eq('parentObjectiveId', objectiveId))
      .first();
    if (children) {
      throw new Error('Cannot delete objective with aligned child objectives');
    }

    // Delete KRs and their check-ins
    const krs = await ctx.db
      .query('keyResults')
      .withIndex('by_objective', (q) => q.eq('objectiveId', objectiveId))
      .collect();

    for (const kr of krs) {
      const checkins = await ctx.db
        .query('goalCheckins')
        .withIndex('by_kr', (q) => q.eq('keyResultId', kr._id))
        .collect();
      for (const c of checkins) {
        await ctx.db.delete(c._id);
      }
      await ctx.db.delete(kr._id);
    }

    await ctx.db.delete(objectiveId);
  },
});

export const addKeyResult = mutation({
  args: {
    objectiveId: v.id('objectives'),
    title: v.string(),
    description: v.optional(v.string()),
    metricType: v.union(
      v.literal('percentage'),
      v.literal('number'),
      v.literal('currency'),
      v.literal('boolean'),
    ),
    direction: v.union(v.literal('increase'), v.literal('decrease')),
    startValue: v.number(),
    targetValue: v.number(),
    unit: v.optional(v.string()),
    weight: v.number(),
    ownerId: v.id('users'),
  },
  handler: async (ctx, { objectiveId, ...krData }) => {
    const obj = await ctx.db.get(objectiveId);
    if (!obj) throw new Error('Objective not found');
    if (obj.status === 'completed' || obj.status === 'cancelled') {
      throw new Error('Cannot add KR to closed objective');
    }

    // Get next order
    const existing = await ctx.db
      .query('keyResults')
      .withIndex('by_objective', (q) => q.eq('objectiveId', objectiveId))
      .collect();

    const now = Date.now();
    const krId = await ctx.db.insert('keyResults', {
      objectiveId,
      organizationId: obj.organizationId,
      ...krData,
      currentValue: krData.startValue,
      confidence: 'none',
      order: existing.length,
      createdAt: now,
      updatedAt: now,
    });

    return krId;
  },
});

export const updateKeyResult = mutation({
  args: {
    keyResultId: v.id('keyResults'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    targetValue: v.optional(v.number()),
    weight: v.optional(v.number()),
  },
  handler: async (ctx, { keyResultId, ...updates }) => {
    const kr = await ctx.db.get(keyResultId);
    if (!kr) throw new Error('Key Result not found');

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.targetValue !== undefined) patch.targetValue = updates.targetValue;
    if (updates.weight !== undefined) patch.weight = updates.weight;

    await ctx.db.patch(keyResultId, patch);
  },
});

export const deleteKeyResult = mutation({
  args: { keyResultId: v.id('keyResults') },
  handler: async (ctx, { keyResultId }) => {
    const kr = await ctx.db.get(keyResultId);
    if (!kr) throw new Error('Key Result not found');

    // Delete check-ins
    const checkins = await ctx.db
      .query('goalCheckins')
      .withIndex('by_kr', (q) => q.eq('keyResultId', keyResultId))
      .collect();
    for (const c of checkins) {
      await ctx.db.delete(c._id);
    }

    await ctx.db.delete(keyResultId);

    // Recompute objective progress
    const remainingKRs = await ctx.db
      .query('keyResults')
      .withIndex('by_objective', (q) => q.eq('objectiveId', kr.objectiveId))
      .collect();
    const newProgress = computeObjectiveProgress(remainingKRs);
    await ctx.db.patch(kr.objectiveId, { progress: newProgress, updatedAt: Date.now() });
  },
});

export const checkin = mutation({
  args: {
    keyResultId: v.id('keyResults'),
    userId: v.id('users'),
    newValue: v.number(),
    note: v.optional(v.string()),
    confidence: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
  },
  handler: async (ctx, { keyResultId, userId, newValue, note, confidence }) => {
    const kr = await ctx.db.get(keyResultId);
    if (!kr) throw new Error('Key Result not found');

    const obj = await ctx.db.get(kr.objectiveId);
    if (!obj) throw new Error('Objective not found');

    // Block check-ins on closed objectives
    if (obj.status === 'completed' || obj.status === 'cancelled') {
      throw new Error('Cannot check in on a closed objective');
    }

    // Validate boolean bounds
    if (kr.metricType === 'boolean' && (newValue < 0 || newValue > 1)) {
      throw new Error('Boolean KR value must be 0 or 1');
    }

    const now = Date.now();

    // Record check-in
    await ctx.db.insert('goalCheckins', {
      keyResultId,
      objectiveId: kr.objectiveId,
      organizationId: kr.organizationId,
      userId,
      previousValue: kr.currentValue,
      newValue,
      note,
      confidence,
      createdAt: now,
    });

    // Update KR
    await ctx.db.patch(keyResultId, {
      currentValue: newValue,
      confidence,
      updatedAt: now,
    });

    // Recompute objective progress
    const allKRs = await ctx.db
      .query('keyResults')
      .withIndex('by_objective', (q) => q.eq('objectiveId', kr.objectiveId))
      .collect();
    // Use updated value for this KR
    const krsForCalc = allKRs.map((k) =>
      k._id === keyResultId ? { ...k, currentValue: newValue } : k
    );
    const newProgress = computeObjectiveProgress(krsForCalc);
    await ctx.db.patch(kr.objectiveId, { progress: newProgress, updatedAt: now });

    return { newProgress };
  },
});

export const completeObjective = mutation({
  args: { objectiveId: v.id('objectives') },
  handler: async (ctx, { objectiveId }) => {
    const obj = await ctx.db.get(objectiveId);
    if (!obj) throw new Error('Objective not found');
    if (obj.status !== 'active') throw new Error('Only active objectives can be completed');

    await ctx.db.patch(objectiveId, { status: 'completed', updatedAt: Date.now() });
  },
});

export const cancelObjective = mutation({
  args: { objectiveId: v.id('objectives') },
  handler: async (ctx, { objectiveId }) => {
    const obj = await ctx.db.get(objectiveId);
    if (!obj) throw new Error('Objective not found');
    if (obj.status === 'completed') throw new Error('Cannot cancel a completed objective');

    await ctx.db.patch(objectiveId, { status: 'cancelled', updatedAt: Date.now() });
  },
});
