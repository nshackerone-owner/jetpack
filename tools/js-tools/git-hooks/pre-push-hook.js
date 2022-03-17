#!/usr/bin/env node

/* eslint-disable no-console */
const isJetpackDraftMode = require( './jetpack-draft' );
const { spawnSync } = require( 'child_process' );
const chalk = require( 'chalk' );

/**
 * Checks if changelog files are required.
 */
async function checkChangelogFiles() {
	console.log( chalk.green( 'Checking if changelog files are needed. Just a sec...' ) );

	// Bail if we're pushing to a release branch, like boost/branch-1.3.0
	let currentBranch = spawnSync( 'git', [ 'branch', '--show-current' ] );
	currentBranch = currentBranch.stdout.toString().trim();
	const branchReg = /.*\/branch-(\d+).(\d+)(.(\d+))?/; // match example: jetpack/branch-1.2.3
	if ( currentBranch.match( branchReg ) ) {
		console.log( chalk.green( 'Release branch detected. Skipping changelog test.' ) );
		return;
	}

	// boost/branch-1.3.0
	const needChangelog = spawnSync(
		'tools/check-changelogger-use.php',
		[ 'origin/master', 'HEAD' ],
		{
			stdio: 'inherit',
			cwd: __dirname + '/../../../',
		}
	);

	// If a changelog file is needed, quit the push.
	if ( needChangelog.status === 0 ) {
		console.log( chalk.green( 'Changelog check passed.' ) );
	} else if ( isJetpackDraftMode() ) {
		console.log(
			chalk.yellow(
				"Allowing push because you're in draft mode. To exit draft mode, use `jetpack draft disable`"
			)
		);
	} else {
		try {
			// Run the changelogger.
			const autoChangelog = spawnSync( 'jetpack', [ 'changelog', 'add' ], {
				stdio: 'inherit',
			} );

			// If the autochangelogger worked, commit the changelog files.
			if ( autoChangelog.status === 0 ) {
				const filesToCommit = [];
				const changelogFiles = await spawnSync( 'git', [
					'diff',
					'--name-only',
					'--diff-filter=A',
					'--cached',
				] )
					.stdout.toString()
					.trim()
					.split( '\n' );

				for ( const file of changelogFiles ) {
					const match = file.match( /^projects\/([^/]+\/[^/]+)\/changelog\// );
					if ( match ) {
						filesToCommit.push( file );
					}
				}

				if ( filesToCommit.length > 0 ) {
					const commitFiles = await spawnSync( 'git', [
						'commit',
						...filesToCommit,
						'-m',
						'changelog',
					] );
					if ( commitFiles.status === 0 ) {
						console.log(
							chalk.green( 'Changelog file(s) committed! Go ahead and `git push` again.' )
						);
						throw new Error( 'Your changelog file was committed! Go ahead and `git push` again.' );
					}
				}
			}
		} catch ( e ) {
			console.log( 'Something went wrong', e );
		}
		process.exitCode = 1;
	}
}

checkChangelogFiles();
