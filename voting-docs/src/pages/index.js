import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const roles = [
  {
    emoji: '🎓',
    title: 'Students',
    badge: 'badge--student',
    badgeLabel: 'Student',
    description:
      'Upload your portfolio, browse submissions from peers, and cast your ranked ballot. Learn how the 3-tier voting system works and what happens after you submit.',
    link: '/user-guide/students',
    linkLabel: 'Student Guide →',
  },
  {
    emoji: '👁️',
    title: 'Staff',
    badge: 'badge--staff',
    badgeLabel: 'Staff',
    description:
      'Monitor voting activity with live aggregate statistics. Understand the approval process, what data you can and cannot see, and the anonymity guarantees built into the system.',
    link: '/user-guide/staff',
    linkLabel: 'Staff Guide →',
  },
  {
    emoji: '🛡️',
    title: 'Administrators',
    badge: 'badge--admin',
    badgeLabel: 'Admin',
    description:
      'Manage the full lifecycle of the voting event. Approve staff accounts, provision student credentials, and control when results are released to all users.',
    link: '/user-guide/admins',
    linkLabel: 'Admin Guide →',
  },
];

const features = [
  {
    icon: '🗳️',
    title: 'Ranked Choice Voting',
    description:
      'Assign 1st (5 pts), 2nd (3 pts), and 3rd (2 pts) choices. Portfolios are ranked by total accumulated points.',
  },
  {
    icon: '🔐',
    title: 'Guaranteed Anonymity',
    description:
      'Individual ballots are hidden from everyone including staff and admins via database-level Row Level Security.',
  },
  {
    icon: '🌐',
    title: 'Domain-Gated Auth',
    description:
      'Secure Google OAuth restricted to @dreamspace.academy accounts, plus credential login for admin-provisioned users.',
  },
  {
    icon: '📊',
    title: 'Live Activity Stats',
    description:
      'Approved staff see real-time aggregate voter turnout and portfolio counts — with no individual ballot data exposed.',
  },
  {
    icon: '📱',
    title: 'Fully Responsive',
    description:
      'Optimized layouts from mobile (<768px) to desktop (>1024px) with smooth CSS transitions and micro-animations.',
  },
  {
    icon: '🏆',
    title: 'Points-Only Scoreboard',
    description:
      'When the admin releases results, a clean leaderboard shows portfolio titles ranked by total points — nothing else.',
  },
];

function HeroSection() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroBadge}>📚 Documentation</div>
        <Heading as="h1" className="hero__title">
          Votable
        </Heading>
        <p className="hero__subtitle">
          The DreamSpace Academy Portfolio Voting System — user guide &amp; developer reference
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/user-guide/getting-started">
            🚀 Get Started
          </Link>
          <Link
            className={clsx('button button--outline button--lg', styles.btnOutlineWhite)}
            to="https://voting-system-ivtksriq3-paul-rajeevans-projects.vercel.app/"
            target="_blank"
          >
            Open Live App ↗
          </Link>
        </div>
      </div>
    </header>
  );
}

function RoleCards() {
  return (
    <section className={styles.rolesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Who are you?</Heading>
          <p>Pick your role to jump straight to the guide that's relevant to you.</p>
        </div>
        <div className={styles.roleGrid}>
          {roles.map((r) => (
            <div key={r.title} className={clsx('card', styles.roleCard)}>
              <div className={styles.roleEmoji}>{r.emoji}</div>
              <span className={r.badge}>{r.badgeLabel}</span>
              <Heading as="h3" className={styles.roleTitle}>
                {r.title}
              </Heading>
              <p className={styles.roleDesc}>{r.description}</p>
              <Link className="button button--primary button--sm" to={r.link}>
                {r.linkLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Key Features</Heading>
          <p>Everything built into the Votable system at a glance.</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.title} className={styles.featureItem}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <strong>{f.title}</strong>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description="User and developer documentation for the DreamSpace Portfolio Voting System.">
      <HeroSection />
      <main>
        <RoleCards />
        <FeaturesSection />
      </main>
    </Layout>
  );
}
