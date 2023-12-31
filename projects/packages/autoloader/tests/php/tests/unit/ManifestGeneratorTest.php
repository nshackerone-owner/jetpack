<?php
/**
 * Autoloader test suite.
 *
 * @package automattic/jetpack-autoloader
 */

use Automattic\Jetpack\Autoloader\ManifestGenerator;
use PHPUnit\Framework\TestCase;

/**
 * Test suite class for the manifest generator
 */
class ManifestGeneratorTest extends TestCase {

	/**
	 * Tests that all of the manifest generation methods do nothing without content.
	 */
	public function test_manifests_do_nothing_without_content() {
		$this->assertNull( ManifestGenerator::buildManifest( 'classmap', 'test', array() ) );
		$this->assertNull( ManifestGenerator::buildManifest( 'psr-4', 'test', array() ) );
		$this->assertNull( ManifestGenerator::buildManifest( 'files', 'test', array() ) );
	}

	/**
	 * Tests that manifests for classmaps are generated correctly.
	 */
	public function test_builds_classmap_manifest() {
		$expected = <<<EXPECTED_FILE
<?php

// This file `test-file.php` was auto generated by automattic/jetpack-autoloader.

\$vendorDir = dirname(__DIR__);
\$baseDir   = dirname(\$vendorDir);

return array(
	'TestFile' => array(
		'version' => '1.0.0.0',
		'path'    => \$vendorDir . '/path_to_file.php'
	),
);

EXPECTED_FILE;

		$content = array(
			'TestFile' => array(
				'path'    => '$vendorDir . \'/path_to_file.php\'',
				'version' => '1.0.0.0',
			),
		);

		$manifest = ManifestGenerator::buildManifest( 'classmap', 'test-file.php', $content );

		$this->assertEquals( $expected, $manifest );
	}

	/**
	 * Tests that manifests for PSR-4 are generated correctly.
	 */
	public function test_builds_psr_manifest() {
		$expected = <<<EXPECTED_FILE
<?php

// This file `test-file2.php` was auto generated by automattic/jetpack-autoloader.

\$vendorDir = dirname(__DIR__);
\$baseDir   = dirname(\$vendorDir);

return array(
	'Automattic\\\\Jetpack\\\\' => array(
		'version' => '1.0.0.0',
		'path'    => array( \$vendorDir . '/src' )
	),
);

EXPECTED_FILE;

		$content = array(
			'Automattic\\Jetpack\\' => array(
				'path'    => array( '$vendorDir . \'/src\'' ),
				'version' => '1.0.0.0',
			),
		);

		$manifest = ManifestGenerator::buildManifest( 'psr-4', 'test-file2.php', $content );

		$this->assertEquals( $expected, $manifest );
	}

	/**
	 * Tests that manifests for files are generated correctly.
	 */
	public function test_builds_files_manifest() {
		$expected = <<<EXPECTED_FILE
<?php

// This file `test-file3.php` was auto generated by automattic/jetpack-autoloader.

\$vendorDir = dirname(__DIR__);
\$baseDir   = dirname(\$vendorDir);

return array(
	'123d5a6s7vd' => array(
		'version' => '1.0.0.0',
		'path'    => \$vendorDir . '/path_to_file.php'
	),
);

EXPECTED_FILE;

		$content = array(
			'123d5a6s7vd' => array(
				'path'    => '$vendorDir . \'/path_to_file.php\'',
				'version' => '1.0.0.0',
			),
		);

		$manifest = ManifestGenerator::buildManifest( 'files', 'test-file3.php', $content );

		$this->assertEquals( $expected, $manifest );
	}
}
