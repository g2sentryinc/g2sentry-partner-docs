import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Get Started as a Partner",
    url: "docs/get-started/overview",
    Svg: require("@site/static/img/undraw_get_started.svg").default,
    description: (
      <>
        New to G2 Sentry? Learn how to become a partner, understand the
        benefits, and find resources to help you get started on your journey
        with us.
      </>
    ),
  },
  {
    title: "Partner API",
    url: "docs/partner-api/overview",
    Svg: require("@site/static/img/undraw_partner_api.svg").default,
    description: (
      <>
        The G2 Sentry Partner API allows partners to integrate and interact with
        our services programmatically. Explore the comprehensive documentation
        to get started.
      </>
    ),
  },
  {
    title: "G2 Sentry Portal",
    url: "docs/portal/overview",
    Svg: require("@site/static/img/undraw_portal.svg").default,
    description: (
      <>
        Access the G2 Sentry Partner Portal to manage your account, view
        analytics and statistics, manage billing and access exclusive resources
        designed to help you succeed as a partner.
      </>
    ),
  },
];

function Feature({ Svg, title, url, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <a href={url}>
          <Svg className={styles.featureSvg} role="img" />
        </a>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
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
