'use client';

import React from 'react';
import type { Grocery } from '../components/types';
import { getAvailableGroceries } from '../components/actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

function GroceryCard({ grocery }: { grocery: Grocery }) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <CardContent className="p-0">
        {/* <div className="aspect-video relative">
          <Image
            alt={grocery.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint="fresh vegetables"
          />
        </div> */}
      </CardContent>
      <CardHeader className="flex-grow">
        <CardTitle className="font-headline text-xl">{grocery.name}</CardTitle>
        <CardDescription>{grocery.description}</CardDescription>
      </CardHeader>
      {/* <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={grocery.uploader.avatarUrl} alt={grocery.uploader.name} data-ai-hint="person portrait" />
            <AvatarFallback>{grocery.uploader.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{grocery.uploader.name}</span>
        </div>
        <Button onClick={handleClaimClick} disabled={isClaiming}>
          <HandCoins className="mr-2 h-4 w-4" />
          {isClaiming ? 'Claiming...' : 'Claim It!'}
        </Button>
      </CardFooter> */}
    </Card>
  );
}

export function GroceryGrid({ initialGroceries }: { initialGroceries: Grocery[] }) {
  const [optimisticGroceries, removeOptimisticGrocery] = React.useOptimistic<Grocery[], string>(
    initialGroceries,
    (state, idToRemove) => state.filter(g => g.id !== idToRemove)
  );

  // async function handleClaim(id: string) {
  //   removeOptimisticGrocery(id);
  //   await claimGrocery(id);
  // }

  if (optimisticGroceries.length === 0) {
    return (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">All groceries have been claimed!</h2>
            <p className="mt-2 text-muted-foreground">Check back later or add a new item.</p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {optimisticGroceries.map(grocery => (
        <GroceryCard key={grocery.id} grocery={grocery} />
      ))}
    </div>
  );
}


export default async function HomeGroceryPage() {
  const groceries = await getAvailableGroceries();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">Available Groceries</h1>
            <p className="text-muted-foreground mt-1">Claim items your coworkers have shared.</p>
          </div>
          {/* <div className="flex gap-2 sm:gap-4">
            <AddGroceryButton />
          </div> */}
        </div>
        <GroceryGrid initialGroceries={groceries} />
      </main>
    </div>
  );
}