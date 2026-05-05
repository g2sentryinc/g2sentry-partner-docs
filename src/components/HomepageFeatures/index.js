import clsx from "clsx";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Get Started as a Partner",
    url: "/docs/get-started/overview",
    Svg: require("@site/static/img/undraw_get_started.svg").default,
    description:
      "New to G2 Sentry? Walk through onboarding, environments, and your first job creation in about ten minutes.",
  },
  {
    title: "Partner API",
    url: "/docs/partner-api/overview",
    Svg: require("@site/static/img/undraw_partner_api.svg").default,
    description:
      "REST endpoints for jobs, statuses, and reviews — plus signed webhook callbacks. Full OpenAPI spec and copy-pasteable curl.",
  },
  {
    title: "G2 Sentry Portal",
    url: "/docs/portal/overview",
    Svg: require("@site/static/img/undraw_portal.svg").default,
    description:
      "Rotate secrets, edit your callback URL, manage teammates, and inspect job timelines in the partner portal.",
  },
];

function Feature({ Svg, title, url, description }) {
  return (
    <div className={clsx("col col--4")}>
      <Link className={styles.featureCard} to={url}>
        <Svg className={styles.featureSvg} role="img" />
        <Heading as="h3" className={styles.featureTitle}>
          {title}
        </Heading>
        <p className={styles.featureBody}>{description}</p>
      </Link>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
