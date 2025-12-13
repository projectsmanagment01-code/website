import ArticleHero from "@/components/ArticleHero";
import { prisma } from '@/lib/prisma';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  
  // Fetch article for hero
  const article = await prisma.article.findUnique({
    where: { slug, status: 'published' },
    include: {
      authorRef: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
          bio: true,
          img: true,
        },
      },
      categoryRef: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <section className="bg-stone-100">
          <div className="container-xl section-sm">
            <ArticleHero article={article} />
          </div>
        </section>
        {children}
      </main>
    </div>
  );
}
