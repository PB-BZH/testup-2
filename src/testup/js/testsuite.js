/*******************************************************************************
 *
 * Copyright 2013-2014 Trimble Navigation Ltd.
 * License: The MIT License (MIT)
 *
 ******************************************************************************/

/*******************************************************************************
 *
 * module TestUp.TestSuite
 *
 ******************************************************************************/

var TestUp = TestUp || {};

TestUp.TestSuite = function() {

  // Public
  return {


    selected_tests : function() {
      var testcases = [];
      $(".testsuite.active .testcase > .title .name").each(function() {
        var $testcase_title = $(this);
        var testcase = $.trim( $testcase_title.text() );
        var $checkbox = $testcase_title.find('input[type=checkbox]');
        var checked = $checkbox.prop('checked');
        if (checked)
        {
          // The hash at the end is require to denote the end of the test case
          // name. Otherwise 'TC_Sketchup' would also run 'TC_Sketchup_Edge'
          // because the names are regex'd.
          testcases.push( testcase + '#.+' );
        }
        else
        {
          // Add induvidually selected tests.
          var $testcase = $testcase_title.parents('.testcase');
          $testcase.find('.test').each(function() {
            var $test = $(this);
            var $test_title = $test.children('.title');
            var $checkbox = $test_title.find('input[type=checkbox]');
            var test_method = $.trim( $test_title.find('.name').text() );
            var checked = $checkbox.prop('checked');
            if (checked)
            {
              testcases.push( testcase + '#' + test_method );
            }
          });
        }
      });
      return testcases;
    },


    update : function($testsuite, testsuite_data) {
      for (testcase_name in testsuite_data)
      {
        var $testcase = TestUp.TestCase.ensure_exist($testsuite, testcase_name);
        var tests = testsuite_data[testcase_name];
        TestUp.TestCase.update($testcase, tests);
      }
    },


    create_html : function(testsuite_data) {
      var html = '';
      for (testcase_name in testsuite_data)
      {
        var tests = testsuite_data[testcase_name];
        var tests_html = TestUp.TestCase.create_tests_html(testcase_name, tests);
        html += TestUp.TestCase.create_html(testcase_name, tests_html);
      }
      return html;
    },


    update_summary : function() {
      var $testsuite = $('.testsuite.active');

      var summary_tests   = $testsuite.find('.test').length
      var summary_passed  = $testsuite.find('.test.passed').length
      var summary_failed  = $testsuite.find('.test.failed').length
      var summary_errors  = $testsuite.find('.test.error').length

      $('#summary_total_tests').find('span').text(summary_tests);
      $('#summary_passed_tests').find('span').text(summary_passed);
      $('#summary_failed_tests').find('span').text(summary_failed);
      $('#summary_error_tests').find('span').text(summary_errors);
    },


    update_results : function(roll_up_down) {
      // This method is called when new tests are discovered, but then the view
      // should not be updated.
      if (roll_up_down == undefined) roll_up_down = true;

      var $testcases = $('.testsuite.active .testcase');
      $testcases.each(function() {
        var $testcase = $(this);
        $testcase.removeClass('passed failed error skipped missing partial');

        var $checkbox = $testcase.find('> .title input[type=checkbox]');
        var selected = $checkbox.prop('checked');

        var tests   = $testcase.find('.test').length
        var passed  = $testcase.find('.test.passed').length
        var failed  = $testcase.find('.test.failed').length
        var errors  = $testcase.find('.test.error').length
        var skipped = $testcase.find('.test.skipped').length
        var missing = $testcase.find('.test.missing').length

        var $metadata = $testcase.find('> .title .metadata');
        $metadata.children('.size').text(tests);
        $metadata.children('.passed').text(passed);
        $metadata.children('.failed').text(failed);
        $metadata.children('.errors').text(errors);
        $metadata.children('.skipped').text(skipped);

        // Pick the most severe status from the tests for the testcase.
        if (failed > 0)
        {
          $testcase.addClass('failed');
        }
        else if (errors > 0)
        {
          $testcase.addClass('error');
        }
        else if (passed > 0)
        {
          $testcase.addClass('passed');
        }

        // Always add missing class to a test case as it doesn't exclude the
        // other statuses.
        if (missing > 0)
        {
          $testcase.addClass('missing');
        }

        // Mark test cases with partial coverage that hasn't been run yet.
        var partially_missing = missing > 0 && missing != tests;
        if (partially_missing && failed == 0 && errors == 0 && passed == 0)
        {
          $testcase.addClass('partial');
        }

        // Roll down all test cases that have failed tests.
        // Roll up test cases only if they are selected. The user probably
        // rolled it down for a reason.
        if (roll_up_down)
        {
          var selected_failed = $testcase.find('.test.failed :checked').length;
          var selected_errors = $testcase.find('.test.error :checked').length;

          if (failed > 0 || errors > 0)
          {
            // Only unroll if tests that ran failed. This allow the user to roll
            // up failed tests while focusing on a sub-set.
            if (selected_failed > 0 || selected_errors > 0)
            {
              $testcase.find('.tests').slideDown('fast');
            }
          }
        }
      });
      TestUp.TestSuite.update_summary();
    }


  };


  // Private


}(); // TestUp
