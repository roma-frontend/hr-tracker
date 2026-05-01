import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { MAX_PAGE_SIZE } from './pagination';

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List surveys for an organization, optionally filtered by status
 */
export const listSurveys = query({
  args: {
    organizationId: v.id('organizations'),
    status: v.optional(
      v.union(v.literal('draft'), v.literal('active'), v.literal('closed')),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { organizationId, status, limit }) => {
    const pageSize = Math.min(limit ?? 50, MAX_PAGE_SIZE);

    let surveyQuery;
    if (status) {
      surveyQuery = ctx.db
        .query('surveys')
        .withIndex('by_org_status', (q) =>
          q.eq('organizationId', organizationId).eq('status', status),
        );
    } else {
      surveyQuery = ctx.db
        .query('surveys')
        .withIndex('by_org_created', (q) =>
          q.eq('organizationId', organizationId),
        );
    }

    const surveys = await surveyQuery.order('desc').take(pageSize);

    // Batch load creators
    const creatorIds = [...new Set(surveys.map((s) => s.createdBy))];
    const creators = await Promise.all(creatorIds.map((id) => ctx.db.get(id)));
    const creatorMap = new Map(
      creators.filter(Boolean).map((u) => [u!._id, u!]),
    );

    return surveys.map((survey) => ({
      ...survey,
      creator: creatorMap.get(survey.createdBy)
        ? {
            name: creatorMap.get(survey.createdBy)!.name,
            avatarUrl: (creatorMap.get(survey.createdBy) as any)?.avatarUrl,
          }
        : null,
    }));
  },
});

/**
 * Get a single survey with its questions
 */
export const getSurveyWithQuestions = query({
  args: {
    surveyId: v.id('surveys'),
  },
  handler: async (ctx, { surveyId }) => {
    const survey = await ctx.db.get(surveyId);
    if (!survey) return null;

    const questions = await ctx.db
      .query('surveyQuestions')
      .withIndex('by_survey_order', (q) => q.eq('surveyId', surveyId))
      .collect();

    const creator = await ctx.db.get(survey.createdBy);

    return {
      ...survey,
      questions,
      creator: creator
        ? { name: creator.name, avatarUrl: (creator as any)?.avatarUrl }
        : null,
    };
  },
});

/**
 * Get survey results/analytics
 */
export const getSurveyResults = query({
  args: {
    surveyId: v.id('surveys'),
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, { surveyId, organizationId }) => {
    const survey = await ctx.db.get(surveyId);
    if (!survey || survey.organizationId !== organizationId) return null;

    const questions = await ctx.db
      .query('surveyQuestions')
      .withIndex('by_survey_order', (q) => q.eq('surveyId', surveyId))
      .collect();

    const responses = await ctx.db
      .query('surveyResponses')
      .withIndex('by_survey', (q) => q.eq('surveyId', surveyId))
      .collect();

    const answers = await ctx.db
      .query('surveyAnswers')
      .withIndex('by_survey', (q) => q.eq('surveyId', surveyId))
      .collect();

    // Aggregate answers per question
    const questionResults = questions.map((question) => {
      const questionAnswers = answers.filter(
        (a) => a.questionId === question._id,
      );

      let aggregation: any = { totalResponses: questionAnswers.length };

      switch (question.type) {
        case 'rating':
        case 'nps': {
          const values = questionAnswers
            .map((a) => a.ratingValue)
            .filter((v): v is number => v !== undefined);
          aggregation.average =
            values.length > 0
              ? values.reduce((sum, v) => sum + v, 0) / values.length
              : 0;
          aggregation.distribution = values.reduce(
            (acc, val) => {
              acc[val] = (acc[val] || 0) + 1;
              return acc;
            },
            {} as Record<number, number>,
          );
          break;
        }
        case 'multiple_choice': {
          const optionCounts: Record<string, number> = {};
          questionAnswers.forEach((a) => {
            a.selectedOptions?.forEach((opt) => {
              optionCounts[opt] = (optionCounts[opt] || 0) + 1;
            });
          });
          aggregation.optionCounts = optionCounts;
          break;
        }
        case 'yes_no': {
          const yesCount = questionAnswers.filter(
            (a) => a.booleanValue === true,
          ).length;
          const noCount = questionAnswers.filter(
            (a) => a.booleanValue === false,
          ).length;
          aggregation.yesCount = yesCount;
          aggregation.noCount = noCount;
          break;
        }
        case 'text': {
          aggregation.textResponses = questionAnswers
            .map((a) => a.textValue)
            .filter(Boolean);
          break;
        }
      }

      return {
        question,
        ...aggregation,
      };
    });

    return {
      survey,
      totalResponses: responses.length,
      questionResults,
    };
  },
});

/**
 * Check if user has already responded to a survey
 */
export const hasUserResponded = query({
  args: {
    surveyId: v.id('surveys'),
    userId: v.id('users'),
  },
  handler: async (ctx, { surveyId, userId }) => {
    const existing = await ctx.db
      .query('surveyResponses')
      .withIndex('by_survey_respondent', (q) =>
        q.eq('surveyId', surveyId).eq('respondentId', userId),
      )
      .first();
    return !!existing;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new survey (admin/supervisor only)
 */
export const createSurvey = mutation({
  args: {
    organizationId: v.id('organizations'),
    createdBy: v.id('users'),
    title: v.string(),
    description: v.optional(v.string()),
    isAnonymous: v.boolean(),
    targetRoles: v.optional(
      v.array(
        v.union(
          v.literal('admin'),
          v.literal('supervisor'),
          v.literal('employee'),
          v.literal('driver'),
        ),
      ),
    ),
    targetDepartments: v.optional(v.array(v.string())),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    questions: v.array(
      v.object({
        type: v.union(
          v.literal('rating'),
          v.literal('multiple_choice'),
          v.literal('text'),
          v.literal('yes_no'),
          v.literal('nps'),
        ),
        text: v.string(),
        description: v.optional(v.string()),
        options: v.optional(v.array(v.string())),
        isRequired: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const surveyId = await ctx.db.insert('surveys', {
      organizationId: args.organizationId,
      title: args.title,
      description: args.description,
      createdBy: args.createdBy,
      status: 'draft',
      isAnonymous: args.isAnonymous,
      targetRoles: args.targetRoles,
      targetDepartments: args.targetDepartments,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      responseCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Create questions
    for (let i = 0; i < args.questions.length; i++) {
      const q = args.questions[i]!;
      await ctx.db.insert('surveyQuestions', {
        organizationId: args.organizationId,
        surveyId,
        type: q.type,
        text: q.text,
        description: q.description,
        options: q.options,
        isRequired: q.isRequired,
        order: i,
        createdAt: now,
      });
    }

    return surveyId;
  },
});

/**
 * Publish a survey (change status from draft to active)
 */
export const publishSurvey = mutation({
  args: {
    surveyId: v.id('surveys'),
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, { surveyId, organizationId }) => {
    const survey = await ctx.db.get(surveyId);
    if (!survey || survey.organizationId !== organizationId) {
      throw new Error('Survey not found');
    }
    if (survey.status !== 'draft') {
      throw new Error('Only draft surveys can be published');
    }

    await ctx.db.patch(surveyId, {
      status: 'active',
      startsAt: survey.startsAt ?? Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Close a survey
 */
export const closeSurvey = mutation({
  args: {
    surveyId: v.id('surveys'),
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, { surveyId, organizationId }) => {
    const survey = await ctx.db.get(surveyId);
    if (!survey || survey.organizationId !== organizationId) {
      throw new Error('Survey not found');
    }
    if (survey.status !== 'active') {
      throw new Error('Only active surveys can be closed');
    }

    await ctx.db.patch(surveyId, {
      status: 'closed',
      endsAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a survey (admin only, draft surveys only)
 */
export const deleteSurvey = mutation({
  args: {
    surveyId: v.id('surveys'),
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, { surveyId, organizationId }) => {
    const survey = await ctx.db.get(surveyId);
    if (!survey || survey.organizationId !== organizationId) {
      throw new Error('Survey not found');
    }
    if (survey.status !== 'draft') {
      throw new Error('Only draft surveys can be deleted');
    }

    // Delete questions
    const questions = await ctx.db
      .query('surveyQuestions')
      .withIndex('by_survey', (q) => q.eq('surveyId', surveyId))
      .collect();
    for (const question of questions) {
      await ctx.db.delete(question._id);
    }

    await ctx.db.delete(surveyId);
  },
});

/**
 * Submit a survey response
 */
export const submitResponse = mutation({
  args: {
    organizationId: v.id('organizations'),
    surveyId: v.id('surveys'),
    respondentId: v.optional(v.id('users')),
    answers: v.array(
      v.object({
        questionId: v.id('surveyQuestions'),
        ratingValue: v.optional(v.number()),
        textValue: v.optional(v.string()),
        selectedOptions: v.optional(v.array(v.string())),
        booleanValue: v.optional(v.boolean()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const survey = await ctx.db.get(args.surveyId);
    if (!survey || survey.organizationId !== args.organizationId) {
      throw new Error('Survey not found');
    }
    if (survey.status !== 'active') {
      throw new Error('Survey is not active');
    }

    // Check duplicate response
    if (args.respondentId) {
      const existing = await ctx.db
        .query('surveyResponses')
        .withIndex('by_survey_respondent', (q) =>
          q
            .eq('surveyId', args.surveyId)
            .eq('respondentId', args.respondentId!),
        )
        .first();
      if (existing) {
        throw new Error('You have already responded to this survey');
      }
    }

    const now = Date.now();

    // Create response record
    const responseId = await ctx.db.insert('surveyResponses', {
      organizationId: args.organizationId,
      surveyId: args.surveyId,
      respondentId: args.respondentId,
      anonymousToken: survey.isAnonymous
        ? `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`
        : undefined,
      submittedAt: now,
    });

    // Insert answers
    for (const answer of args.answers) {
      await ctx.db.insert('surveyAnswers', {
        organizationId: args.organizationId,
        surveyId: args.surveyId,
        responseId,
        questionId: answer.questionId,
        ratingValue: answer.ratingValue,
        textValue: answer.textValue,
        selectedOptions: answer.selectedOptions,
        booleanValue: answer.booleanValue,
        createdAt: now,
      });
    }

    // Increment response count
    await ctx.db.patch(args.surveyId, {
      responseCount: survey.responseCount + 1,
      updatedAt: now,
    });

    return responseId;
  },
});
