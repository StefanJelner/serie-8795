import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class UlamGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName =
    'Ulam Sequence (unique sum of two distinct earlier terms)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;
  static override readonly recommendedStartValues: Record<string, number[]> = {
    '1, 2': [1, 2],
    '2, 3': [2, 3],
    '3, 5': [3, 5],
    '4, 7': [4, 7],
    '6, 11': [6, 11],
    '7, 12': [7, 12],
    '8, 13': [8, 13],
    '9, 14': [9, 14],
    '10, 15': [10, 15],
    '11, 17': [11, 17],
    '12, 19': [12, 19],
    '13, 20': [13, 20],
    '14, 22': [14, 22],
    '15, 24': [15, 24],
    '16, 25': [16, 25],
    '17, 27': [17, 27],
    '18, 29': [18, 29],
    '19, 30': [19, 30],
    '20, 31': [20, 31],
    '21, 33': [21, 33],
    '22, 35': [22, 35],
    '23, 36': [23, 36],
    '24, 38': [24, 38],
    '25, 39': [25, 39],
    '26, 41': [26, 41],
    '27, 43': [27, 43],
    '28, 44': [28, 44],
    '29, 46': [29, 46],
    '30, 47': [30, 47],
    '31, 49': [31, 49],
    '32, 51': [32, 51],
    '33, 52': [33, 52],
    '34, 54': [34, 54],
    '35, 55': [35, 55],
    '36, 57': [36, 57],
    '37, 59': [37, 59],
    '38, 60': [38, 60],
    '39, 62': [39, 62],
    '40, 63': [40, 63],
    '41, 65': [41, 65],
    '42, 67': [42, 67],
    '43, 68': [43, 68],
    '44, 70': [44, 70],
    '45, 71': [45, 71],
    '46, 73': [46, 73],
    '47, 75': [47, 75],
    '48, 76': [48, 76],
    '49, 78': [49, 78],
    '50, 79': [50, 79],
    '51, 81': [51, 81],
    '52, 83': [52, 83],
    '53, 84': [53, 84],
    '54, 86': [54, 86],
    '55, 87': [55, 87],
    '56, 89': [56, 89],
    '57, 91': [57, 91],
    '58, 92': [58, 92],
    '59, 94': [59, 94],
    '60, 95': [60, 95],
    '61, 97': [61, 97],
    '62, 99': [62, 99],
    '63, 100': [63, 100],
    '64, 102': [64, 102],
    '65, 103': [65, 103],
    '66, 105': [66, 105],
    '67, 107': [67, 107],
    '68, 108': [68, 108],
    '69, 110': [69, 110],
    '70, 111': [70, 111],
    '71, 113': [71, 113],
    '72, 115': [72, 115],
    '73, 116': [73, 116],
    '74, 118': [74, 118],
    '75, 119': [75, 119],
    '76, 121': [76, 121],
    '77, 123': [77, 123],
    '78, 124': [78, 124],
    '79, 126': [79, 126],
    '80, 127': [80, 127],
    '81, 129': [81, 129],
    '82, 131': [82, 131],
    '83, 132': [83, 132],
    '84, 134': [84, 134],
    '85, 135': [85, 135],
    '86, 137': [86, 137],
    '87, 139': [87, 139],
    '88, 140': [88, 140],
    '89, 142': [89, 142],
    '90, 143': [90, 143],
    '91, 145': [91, 145],
    '92, 147': [92, 147],
    '93, 148': [93, 148],
    '94, 150': [94, 150],
    '95, 151': [95, 151],
    '96, 153': [96, 153],
    '97, 155': [97, 155],
    '98, 156': [98, 156],
    '99, 158': [99, 158],
    '100, 159': [100, 159],
  };

  private static ulam(seq: number[]): number {
    const used = new Set<number>();
    const unique = new Set<number>();
    const len = seq.length;

    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const sum = seq[i] + seq[j];

        if (used.has(sum)) {
          unique.delete(sum);
        } else {
          used.add(sum);
          unique.add(sum);
        }
      }
    }

    return Math.min(...unique);
  }

  protected override _rootMidi!: number;
  protected override _toneRange!: number;
  protected override _startValue!: number[];
  protected override _reverse!: boolean;

  private _sequence: number[] = [];

  init(
    rootMidi: number,
    toneRange: number,
    startValue: number | string = '1, 2',
    reverse: boolean = false,
  ) {
    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._reverse = reverse;
    this._startValue = UlamGenerator.recommendedStartValues[startValue].slice();
    this._sequence = this._startValue.slice();
    this._index = 0;
  }

  override reset() {
    super.reset();

    this._sequence = this._startValue.slice();
  }

  protected nextNote(): number {
    const value = this._sequence[this._sequence.length - 1];
    const next = UlamGenerator.ulam(this._sequence);

    this._sequence.push(next);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return UlamGenerator.limitToMidi(midi);
  }
}
