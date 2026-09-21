import type { Metadata } from 'next';
import './globals.css';
import './central-editorial.css';
import './text-arrival.css';
import './accel-gallery.css';
import './gallery-fix.css';
import './text-legibility.css';
import './pause-choices.css';
import './commute-gallery.css';
import './bottom-fragments.css';
import './bottom-fragments-fix.css';
import './mid-fragments.css';
import './mid-fragments-extra.css';
import './mong-kok.css';
import './mong-kok-assets.css';
import './sham-shui-po.css';
import './ssp-interaction.css';
import './ssp-scene-motion.css';
import './west-kowloon.css';
import './west-kowloon-fix.css';
import './west-interactions.css';
import './west-selection-fix.css';
import './west-advanced-interactions.css';
import './ssp-layout-fix.css';
import './kennedy-town.css';
import './hero-compositions.css';
import './mood.css';

export const metadata: Metadata = {
  title: 'City Mood Map — Hong Kong',
  description: 'An interactive digital experience about how urban spaces shape emotion.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
