import styles from '../styles/Home.module.css';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { FormattedMessage } from 'react-intl';

const Home: NextPage = () => {
	return (
		<div className={styles.container}>
			<Head>
				<title>
					<FormattedMessage defaultMessage='Create Next App' id="9x6Yuc" />
				</title>
				<meta name='description' content='Generated by create next app' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className={styles.main}>
				<h1 className={styles.title}>
					<FormattedMessage defaultMessage='Welcome!' id="Q+U0TW" />
				</h1>

				<div className={styles.grid}>
					<a href='https://nextjs.org/docs' className={styles.card}>
						<h2>
							<FormattedMessage defaultMessage='Documentation' id="isGKnz" />
						</h2>
						<p>
							<FormattedMessage defaultMessage='Find in-depth information about Next.js features and API.' id="J2uzO1" />
						</p>
					</a>

					<a href='https://nextjs.org/learn' className={styles.card}>
						<h2>
							<FormattedMessage defaultMessage='Learn' id="IbrSk1" />
						</h2>
						<p>
							<FormattedMessage defaultMessage='Learn about Next.js in an interactive course with quizzes!' id="jdABpR" />
						</p>
					</a>

					<a href='https://github.com/vercel/next.js/tree/canary/examples' className={styles.card}>
						<h2>
							<FormattedMessage defaultMessage='Examples' id="3GLH+d" />
						</h2>
						<p>
							<FormattedMessage defaultMessage='Discover and deploy boilerplate example Next.js projects.' id="1Mb24G" />
						</p>
					</a>

					<a
						href='https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'
						className={styles.card}
					>
						<h2>
							<FormattedMessage defaultMessage='Deploy' id="556JQK" />
						</h2>
						<p>
							<FormattedMessage defaultMessage='Instantly deploy your Next.js site to a public URL with Vercel.' id="Mx6xjj" />
						</p>
					</a>
				</div>
			</main>

			<footer className={styles.footer}>
				<a
					href='https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'
					target='_blank'
					rel='noopener noreferrer'
				>
					<FormattedMessage defaultMessage='Powered by ' id="Sl0m2s" />
					<span className={styles.logo}>
						<Image src='/vercel.svg' alt='Vercel Logo' width={72} height={16} />
					</span>
				</a>
			</footer>
		</div>
	);
};

export default Home;
