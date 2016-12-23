<?php

// function hello_world($a, $b, $c, $d = null): int
// {
//     // code
// }

function test_optional()
{
    return 5;
}

class Test {
    public function tooManyArguments($a, $b = 4, $c, $d = null)
    {
        // code
    }

    public function tooManyArguments2($a, $b, $c, $d = null)
    {
        $g = $a + $b;

        if ($g !== 5) {
            throw new \RuntimeException();
        }
        return $d;
    }
}

interface ITest {
    public function oneOrMore($a, $be, $c, $d, $e);
}

trait TTest {
    public function tooManyArguments3($a, $b, $c, $d = null): bool
    {
        return $d;
    }
}
