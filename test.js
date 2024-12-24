function getPositionPriNumber(n = 10) {
    let mapNumber = {};
    let arrayResult = [];
    let arrayPositionPrimeNumber = [];
    // Set random number from 1 to 100000 unique
    for (let i = 0; i < n; i++) {
        let arrayCurrent = [];
        for (let j = 0; j < n; j++) {
            // Get random number from 1 to 100000
            let randomNumber = Math.floor(Math.random() * 100000) + 1;
            while (randomNumber in mapNumber) {
                randomNumber = Math.floor(Math.random() * 100000) + 1;
            }
            mapNumber[randomNumber] = true;
            arrayCurrent.push(randomNumber);
            if (checkIsNumberIsPrime(randomNumber)) {
                arrayPositionPrimeNumber.push([i, j]);
            }
        }
        arrayResult.push(arrayCurrent);
    }
    return {
        arrayResult,
        arrayPositionPrimeNumber
    }
}
function checkIsNumberIsPrime(number) {
    if (number < 2) return false;
    for (let i = 2; i <= Math.sqrt(number); i++) {
        if (number % i === 0) return false;
    }
    return true;
}
/*
    arrayResult: [
    [
      32533, 43614,  6040,
      69051, 47097, 46157,
      58252, 32765, 23269,
      93586
    ],
    [
      60002, 67009, 33766,
      31878, 59974, 13685,
      24238, 92813, 48729,
       2456
    ],
    [
      75012, 63494, 10256,
      61996, 67867, 27065,
      45325,  8345, 54088,
      86568
    ],
    [
       3884, 26947, 83338,
      32418, 48165, 75320,
      89807, 75163, 47205,
      50775
    ],
    [
      19598, 34238, 25232,
      19404, 58645, 15118,
      76209, 19960,  1157,
      45973
    ],
    [
      20309, 69673, 46450,
      18312, 22544,  3724,
      78276, 48483, 60470,
       8032
    ],
    [
      61100, 34851, 91579,
      82711, 70678, 88650,
      17074, 96616, 90978,
       8190
    ],
    [
       3316, 45854, 59116,
      46615, 82515, 74763,
      25007, 46211, 33470,
      19518
    ],
    [
      93635,  8155, 81912,
      66514, 46373,   884,
      51058, 97181, 33814,
      74404
    ],
    [
      95684, 14040, 51022,
      96250, 23449, 39063,
      94217, 62083, 53279,
      37009
    ]
  ],
  arrayPositionPrimeNumber: [ [ 0, 0 ], [ 0, 8 ], [ 2, 4 ], [ 3, 1 ], [ 9, 8 ] ]
*/
console.log(checkIsNumberIsPrime(32533))