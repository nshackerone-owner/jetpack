<?php

namespace Automattic\Jetpack\WP_JS_Data_Sync\Schema\Types;

use Automattic\Jetpack\WP_JS_Data_Sync\Schema\Parser;

/**
 * ! USE WITH CAUTION !
 * This schema will not parse values. Use only when you're sure that the data can be trusted.
 * For example - this can be used to deliver readonly data to the client.
 */
class Type_Any implements Parser {
	public function parse( $data ) {
		return $data;
	}
}
