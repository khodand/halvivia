import type { RatingChartItem } from '../model/types';
import { Image } from '@imagekit/next';

type RatingItemPosterProps = {
  item: RatingChartItem;
};

export function RatingItemPoster({ item }: RatingItemPosterProps) {
  if (!item.posterUrl) {
    return <div className="h-[90px] w-[60px] shrink-0 rounded-md bg-slate-100" />;
  }
  if (item.type === 'film') {
    return (
      <Image
        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
        src={item.posterUrl}
        alt={item.title}
        className="h-[90px] w-[60px] shrink-0 rounded-md object-cover"
        width={60}
        height={90}
        loading="lazy"
      />
    );
  }

  if (item.type === 'game') {
    return (
      <img
        src={item.posterUrl}
        alt={item.title}
        className="h-14 w-30 shrink-0 rounded-md object-cover"
        width={120}
        height={56}
        loading="lazy"
      />
    );
  }

  return (
    <img
      src={item.posterUrl}
      alt={item.title}
      className="h-[90px] w-[60px] shrink-0 rounded-md object-cover"
      width={60}
      height={90}
      loading="lazy"
    />
  );
}
