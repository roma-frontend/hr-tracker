import { Metadata } from 'next';
import CareersPageWrapper from './CareersPageWrapper';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = `Careers at ${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')}`;
  return {
    title,
    description: `Explore open positions and join our team. View all available jobs at ${slug}.`,
    openGraph: {
      title,
      description: `Explore open positions and join our team.`,
      type: 'website',
    },
  };
}

export default async function CareersSlugPage({ params }: Props) {
  const { slug } = await params;
  return <CareersPageWrapper slug={slug} />;
}
