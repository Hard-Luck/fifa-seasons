import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/app/components/Navigation";
import { GameForm } from "./GameForm";
import { notFound } from "next/navigation";

export default async function AddGamePage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const session = await auth();
  const { leagueId } = await params;

  if (!session?.user?.id) {
    return null;
  }

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      playerA: true,
      playerB: true,
    },
  });

  if (!league) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Game</h1>
          <p className="mt-2 text-gray-600">{league.name}</p>
        </div>

        <GameForm league={league} />
      </main>
    </div>
  );
}
