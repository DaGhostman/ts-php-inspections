<?php
/**
 * Minimal docs :)
 * @param $test string
 */
function hello($test) {
    debug_zval_dump($test);
}

var_dump('test');

class Test {

    public function __construct() {
        var_export('Welcome');

        Some\Random\Framework\Debug::dump('Hello, World');
    }
}

trait A {
    public function test()
    {
        $a = new UltraDebug();
        $a->debug();
        Debug::export('asd');
    }
}

