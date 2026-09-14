import FilmDialogButton from '@/pages/cinema/ui/FilmDialogButton';
import FilterDropdown from '@/pages/cinema/ui/FilterDropdown';
import { verifySession } from '@/shared/lib/auth';

export async function Toolbar() {
  const session = await verifySession();
  const canAddFilm = session.status != 'unauthenticated' && session.payload.role == 'MEMBER';
  return (
    <div className={'flex flex-row justify-between'}>
      <FilterDropdown></FilterDropdown>
      {canAddFilm && <FilmDialogButton />}
    </div>
  );
}

export default Toolbar;
