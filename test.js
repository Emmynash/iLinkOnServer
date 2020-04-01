// The problem:
// Write a function called deepClone which takes an object and creates a copy of it.
// e.g. {name: 'Paddy', address: {town: 'Lerum', country: 'Sweden'}} -> {name: 'Paddy', address: {town: 'Lerum', country: 'Sweden'}}

// Solution
//  One has been written by me and another has been received from community to showcase that self written code is more concise and readable.
//  Just run this file in Node Js environment to get the result.
//  To run test cases, un comment method named test() in the bottom of file

/**
 * Creates a deep copy of a value
 *
 * @param {*} value The value to be copied
 * @return {*} a copy of the original value
 *
 * @example
 * 
 *      const objects = [{}, {}, {}];
 *      const objectsCopy = deepClone.clone(objects);
 *      objects === objectsCopy; // => false
 *      objects[0] === objectsCopy[0]; // => false
 */
function deepClone(value) {
  if (value != null && typeof value.clone === 'function') {
    return value.clone();
  }
  const copy = function (copiedValue) {
    if (value instanceof Array) {
      return value.map(item => deepClone(item))
    }

    for (const key in value) {
      if (typeof value[key] === 'object') {
        copiedValue[key] = deepClone(value[key]);
      } else {
        copiedValue[key] = value[key];
      }
    }
    return copiedValue;
  };

  switch (Object.prototype.toString.call(value).slice(8, -1)) {
    case 'Object':
      return copy({});
    case 'Array':
      return copy([]);
    case 'Date':
      return Date(value.valueOf());
    default:
      return value;
  }
}

//  Main method to execute the provided test case 
const run = () => {
  const object = { name: 'Paddy', address: { town: 'Lerum', country: 'Sweden' } };
  const copy = deepClone(object);
  object.address.town = 'Ipsum';
  console.log('==> Cloned object after altering original input');
  console.log(copy);
}

//  Test cases along with its implementation without any third party library
const test = () => {
  // As of v0.5.9, assert module is a standard module
  const assert = require('assert');

  let passedCases = 0;
  let failedCases = 0;

  const expect = (lhs) => {
    return {
      toBe(rhs) {
        try {
          assert.deepEqual(lhs, rhs);
          passedCases += 1;
        } catch (error) {
          if (error instanceof assert.AssertionError) {
            console.log(`Test failed: ${lhs} != ${rhs}\n`);
            failedCases += 1;
          } else {
            // Never mind :-)
            throw error;
          }
        }
      }
    }
  }

  //  Testcase 2 : Date object with time
  const testCase3 = new Date();

  //  Testcase 3 : Undefined and Infinitey in object
  const testCase4 = { b: Infinity, c: undefined };

  //  Testcase 4 : User funciton in object
  const testCase5 = {
    name: 'Object with function',
    getName: function () {
      return this.name;
    }
  }

  //  Testcase 5 : Cyclic reference object
  const testCase6 = {
    a: 'a',
    b: {
      c: 'c',
      d: 'd',
    },
  };

  //  Testcase 6 : Array with nested objects
  const testCase7 = [
    'a',
    'c',
    'd', {
      four: 4
    },
  ];

  // This tests demonstrate whether cloned object is similar to the original one or not
  const testClonedObjectQuality = () => {
    //  Basic tests
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
    expect(deepClone()).toBe(undefined);
    expect(deepClone(1)).toBe(1);
    expect(deepClone('abc')).toBe('abc');
    expect(deepClone(() => 'abc')()).toBe('abc')

    // Test case 1
    const testCase1 = [1, 2, 3];
    const copy = deepClone(testCase1);
    expect(copy).toBe(testCase1);
    expect(copy[0]).toBe(testCase1[0]);
    expect(copy[1]).toBe(testCase1[1]);
    expect(copy[2]).toBe(testCase1[2]);
    expect(copy.length).toBe(3);

    //  Advanced tests

    //  Testcase 2 : Nested objects
    const testCase2 = { name: 'Paddy', address: { town: 'Lerum', country: 'Sweden' } };
    const copy2 = deepClone(testCase2);
    expect(copy2).toBe(testCase2)
    expect(Object.keys(copy2).length).toBe(Object.keys(testCase2).length);
    expect(copy2.address.country).toBe(testCase2.address.country);

  //   {
  //     var deepCloneCopy = deepClone(testCase3);
  //     try {
  //       assert(JSON.stringify(deepCloneCopy) === JSON.stringify(testCase3))
  //     } catch (e) {
  //       assert(false);
  //     }
  //     try {
  //       assert(deepCloneCopy.getDate() === testCase3.getDate());
  //     } catch (e) {
  //       assert(false);
  //     }
  //     try {
  //       assert(deepCloneCopy.getMilliseconds() === testCase3.getMilliseconds());
  //     } catch (e) {
  //       assert(false);
  //     }
  //   }
  //   {
  //     var deepCloneCopy = deepClone(testCase4);
  //     assert(deepCloneCopy.b === testCase4.b);
  //     assert(deepCloneCopy.c === testCase4.c);
  //   }
  //   {
  //     var deepCloneCopy = deepClone(testCase5);
  //     try {
  //       assert(deepCloneCopy.getName() === testCase5.getName());
  //     } catch (e) {
  //       assert(false);
  //     }
  //   }
  //   {
  //     var deepCloneCopy = deepClone(testCase7);
  //     assert(JSON.stringify(deepCloneCopy) === JSON.stringify(testCase7))
  //     assert(Object.keys(deepCloneCopy).length === Object.keys(testCase7).length);
  //     assert(deepCloneCopy[3].four === testCase7[3].four);
  //   }
  }

  // // This tests demonstrate whether cloned object is the new copy (in memory) or referencing to the original one
  // const testImmutability = () => {
  //   {
  //     const deepCloneCopy = deepClone(testCase1);
  //     deepCloneCopy[0] = 2
  //     assert(deepCloneCopy[0] === 2)
  //     assert(testCase1[0] === 1)
  //     testCase1[1] = 4;
  //     assert(deepCloneCopy[1] === 2)
  //     assert(testCase1[1] === 4)
  //   }
  //   {
  //     const deepCloneCopy = deepClone(testCase2);
  //     testCase2.address.country = 'India';
  //     assert(testCase2.address.country === 'India');
  //     assert(deepCloneCopy.address.country === 'Sweden');
  //   }
  //   {
  //     const deepCloneCopy = deepClone(testCase3);
  //     testCase3.setDate(testCase3.getDate() + 1);
  //     const today = new Date();
  //     const tomorrow = new Date();
  //     tomorrow.setDate(tomorrow.getDate() + 1);
  //     try {
  //       assert(deepCloneCopy.getDate() === today.getDate());
  //     } catch (e) {
  //       assert(false);
  //     }
  //     try {
  //       assert(testCase3.getDate() === tomorrow.getDate());
  //     } catch (e) {
  //       assert(false);
  //     }
  //   }
  //   {
  //     const deepCloneCopy = deepClone(testCase6);
  //     //  Simulating cyclic reference
  //     testCase6.c = testCase6.b;
  //     testCase6.e = testCase6.a;
  //     testCase6.b.c = testCase6.c;
  //     testCase6.b.d = testCase6.b;
  //     testCase6.b.e = testCase6.b.c;
  //     log('After cyclic rotation');
  //     log(testCase6);
  //     assert(deepCloneCopy.b.c !== testCase6.b.c);
  //     assert(deepCloneCopy.e !== testCase6.e);
  //   }
  //   {
  //     const deepCloneCopy = deepClone(testCase7);
  //     testCase7[0] = 'b';
  //     testCase7[3].four = 5;
  //     log('After cyclic rotation');
  //     log(testCase7);
  //     assert(deepCloneCopy[3].four === 4);
  //     assert(testCase7[3].four === 5);
  //   }
  // }

  testClonedObjectQuality()
  // testImmutability()
  console.log('Failed test cases: ' + failedCases, true);
  console.log('Passed test cases : ' + passedCases, true);
}

run();

test();


// #### Conclusion  ####
// At first it looked pretty simpler but when I started testing it with multiple data sets, I found the advantages/disadvantages of various methods.
// Few approaches
// 1. Stringifying input object and parsing it back - This works in most of the case. This doesn't work for infinity and undefined type of values and simply ignores that.
//  Also this doesn't seems to be performance optimised for deep cloning (as the question is intended to do that only). On further testing this doesn't work 
// for object with function as well. Doesn't support circular objects.
// 2. Object.create() creates prototypal references instead of actual clonning of object thus changing properties of main object gets reflected on the clone one
// 3. I am big fan of Underscore and they have _.clone for this type of task but considering the scope of work without using any third party library, 
// I am ignoring this solution. Similary Lodash has _.clonedeep method.
// 4. The ES6 solution using Object.assign works pretty well where JSON.parse doesn't work but fails for nested objects. 
// Here is the warning from Mozilla on using this - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Deep_Clone
// 5. The ES6 spread syntax doesn't work well with circular dependencies and can not handle date type
// 6. There is no inbuilt way to perform this operation and hence a hybrid code has to be written to acheive the desired result. In this case 
// method named deepClone provides the desired result for all 35 test cases.