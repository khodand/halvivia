import AddGameDialogButton from '@/features/addGame/ui/AddGameDialogButton';

type GamesToolbarProps = {
  canAddGames: boolean;
};

export function GamesToolbar({ canAddGames }: GamesToolbarProps) {
  if (!canAddGames) {
    return null;
  }

  return (
    <div className="flex justify-end">
      <AddGameDialogButton />
    </div>
  );
}
