import { PublicAppChrome } from '@/components/shared/public-app-chrome';

/**
 * Public app views (explore, campaign/profile detail): guest-accessible and
 * shareable. Guests get the public navbar + footer; signed-in creators/businesses
 * get the dashboard shell wrapped around the same content (so opening a campaign
 * keeps them in the app instead of on the marketing header). See `PublicAppChrome`.
 */
export default function PublicAppLayout({ children }: { children: React.ReactNode }) {
  return <PublicAppChrome>{children}</PublicAppChrome>;
}
