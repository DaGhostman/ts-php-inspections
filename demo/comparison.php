<?php
/**
 * Some namespace & file description
 */
namespace foo {
  function bar(int $a, $b) {
    if ($a > $b || isset($b) || $a == $b) {
        if (2 != 1) {
          return 4;
        }

        return false;
    }

    if ($a = $b) {

    }

    if ($a == $b) {
      if ($b != $a) {
        return 5;
      }
    }

    if ($a instanceof $b) {
      // something something
    }

    if (false == $b) {
      return $b;
    }

    if ($a == true) {
      return $b;
    }

    if (in_array('test', $b)) {

    }
  }
  // will print : 5
  echo bar(2, 3);
}
