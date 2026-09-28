import { CvClientsMarquee } from "../src/components/CvClientsMarquee/CvClientsMarquee";
import { CvCta } from "../src/components/CvCta/CvCta";
import { CvFooter } from "../src/components/CvFooter/CvFooter";
import { CvHeader } from "../src/components/CvHeader/CvHeader";
import { CvHero } from "../src/components/CvHero/CvHero";
import { CvOffers } from "../src/components/CvOffers/CvOffers";
import { CvStats } from "../src/components/CvStats/CvStats";
import { CvStructuroSection } from "../src/components/CvStructuroSection/CvStructuroSection";
import { CvTechSection } from "../src/components/CvTechSection/CvTechSection";
import { CvTestimonials } from "../src/components/CvTestimonials/CvTestimonials";

/**
 * Assemblage de la homepage tel qu'il sera fait dans le Designer : chaque
 * composant est posé dans une Section native portant l'ancre (id) — les ids
 * doivent être sur les éléments Webflow, pas dans le Shadow DOM des composants.
 */
export function HomePage() {
  return (
    <>
      <CvHeader />
      <main>
        <section id="top">
          <CvHero />
        </section>
        <section id="clients">
          <CvClientsMarquee />
        </section>
        <section id="offres-detail">
          <CvOffers />
        </section>
        <section id="chiffres">
          <CvStats />
        </section>
        <section id="technologie">
          <CvTechSection />
        </section>
        <section id="structuro">
          <CvStructuroSection />
        </section>
        <section id="temoignages">
          <CvTestimonials />
        </section>
        <section id="contact">
          <CvCta />
        </section>
      </main>
      <CvFooter />
    </>
  );
}
