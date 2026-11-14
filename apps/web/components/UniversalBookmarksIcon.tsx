import UniversalBookmarksFull from "@/public/icons/universalbookmarks-full.svg";

export default function UniversalBookmarksLogo({ height }: { height: number }) {
  return (
    <span className="flex items-center">
      <UniversalBookmarksFull height={height} className={`fill-foreground`} />
    </span>
  );
}
