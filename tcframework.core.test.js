
/*
    TCFramework
    Copyright (c) 2021 Thomas Cort <linuxgeek@gmail.com>

    Permission to use, copy, modify, and distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

'use strict';

const {
    TestRunner,
    TestSuite,
    TestCase,
    ConsoleTestReporter,
    expect,
    LengthCheck,
    MaxLengthCheck,
    MinLengthCheck,
    TypeCheck,
    PatternCheck,
    JSONPointer,
    TCTemplate,
    mtrand,
    CombUUID,
} = require('./tcframework.core');

////////////////////////////////////////////
//
// all the tests!
//
////////////////////////////////////////////

new TestRunner([

    new TestSuite('LengthCheck', [

        new TestCase('checks that expected length matches input', () => {
            [
                { length: 0, value: '' },
                { length: 0, value: [] },
                { length: 1, value: 'x' },
                { length: 1, value: ['x'] },
                { length: 3, value: 'foo' },
                { length: 3, value: [1,2,3] },
            ].forEach((testcase) => expect(() => new LengthCheck(testcase.length).check(testcase.value)).notToThrow());
        }),
        new TestCase('throws error when expected length does not match input', () => {
            [
                { length: 0, value: 'apple' },
                { length: 1, value: 'apple' },
                { length: 1, value: '' },
                { length: 3, value: 'apple' },
            ].forEach((testcase) => expect(() => new LengthCheck(testcase.length).check(testcase.value)).toThrow('LengthCheckError'));
        }),

    ]),

    new TestSuite('MaxLengthCheck', [

        new TestCase('checks that max length is greater than or equal to input length', () => {
            [
                { length: 0, value: '' },
                { length: 0, value: [] },
                { length: 1, value: 'x' },
                { length: 1, value: ['x'] },
                { length: 2, value: 'x' },
                { length: 3, value: [1,2] },
                { length: 3, value: 'foo' },
                { length: 3, value: [1,2,3] },
            ].forEach((testcase) => expect(() => new MaxLengthCheck(testcase.length).check(testcase.value)).notToThrow());
        }),
        new TestCase('throws error when max length is not greater than or equal to input length', () => {
            [
                { length: 0, value: 'apple' },
                { length: 1, value: 'apple' },
                { length: 1, value: 'fo' },
                { length: 3, value: 'apple' },
            ].forEach((testcase) => expect(() => new MaxLengthCheck(testcase.length).check(testcase.value)).toThrow('MaxLengthCheckError'));
        }),

    ]),

    new TestSuite('MinLengthCheck', [

        new TestCase('checks that min length is less than or equal to input length', () => {
            [
                { length: 0, value: '' },
                { length: 0, value: [] },
                { length: 1, value: 'x' },
                { length: 1, value: ['x'] },
                { length: 2, value: 'xxx' },
                { length: 3, value: [1,2,3,4,5] },
                { length: 3, value: 'foo' },
                { length: 3, value: [1,2,3] },
            ].forEach((testcase) => expect(() => new MinLengthCheck(testcase.length).check(testcase.value)).notToThrow());
        }),
        new TestCase('throws error when min length is not less than or equal to input length', () => {
            [
                { length: 1, value: '' },
                { length: 2, value: 'x' },
                { length: 3, value: '42' },
            ].forEach((testcase) => expect(() => new MinLengthCheck(testcase.length).check(testcase.value)).toThrow('MinLengthCheckError'));
        }),

    ]),

    new TestSuite('TypeCheck', [

        new TestCase('checks that expected type matches type of input', () => {
            [
                { type: 'string', value: '' },
                { type: 'string', value: 'hello' },
                { type: 'object', value: {} },
                { type: 'object', value: { foo: 1, bar: 2 } },
                { type: 'object', value: null },
                { type: 'object', value: new Date() },
                { type: 'object', value: /foobar/g },
                { type: 'number', value: 4 },
                { type: 'number', value: 0 },
                { type: 'number', value: -40 },
                { type: 'undefined', value: undefined },
            ].forEach((testcase) => expect(() => new TypeCheck(testcase.type).check(testcase.value)).notToThrow());
        }),
        new TestCase('throws error when expected type does not match type of input', () => {
            [
                { type: 'string', value: 4 },
                { type: 'string', value: null },
                { type: 'number', value: '' },
                { type: 'object', value: '' },
                { type: 'object', value: -52 },
                { type: 'undefined', value: /xy/g },
                { type: 'number', value: new Date() },
            ].forEach((testcase) => expect(() => new TypeCheck(testcase.type).check(testcase.value)).toThrow('TypeCheckError'));
        }),

    ]),

    new TestSuite('PatternCheck', [

        new TestCase('checks that expected pattern matches input', () => {
            [
                { pattern: /apple/, value: 'crabapple' },
                { pattern: /^[0-9]+$/, value: '1234567' },
            ].forEach((testcase) => expect(() => new PatternCheck(testcase.pattern).check(testcase.value)).notToThrow());
        }),
        new TestCase('throws error when expected pattern does not match input', () => {
            [
                { pattern: /apple/, value: 'pear' },
                { pattern: /^[a-z]+$/, value: 'apple sauce' },
            ].forEach((testcase) => expect(() => new PatternCheck(testcase.pattern).check(testcase.value)).toThrow('PatternCheckError'));
        }),

    ]),

    new TestSuite('JSONPointer', [

        new TestCase('JSONPointer.get() gives the same results as the RFC', () => {

            const doc = {
                "foo": ["bar", "baz"],
                "": 0,
                "a/b": 1,
                "c%d": 2,
                "e^f": 3,
                "g|h": 4,
                "i\\j": 5,
                "k\"l": 6,
                " ": 7,
                "m~n": 8,
            };

            [
                { ptr: '', expected: doc },
                { ptr: '/foo', expected: doc.foo },
                { ptr: '/foo/0', expected: doc.foo[0] },
                { ptr: '/', expected: 0 },
                { ptr: '/a~1b', expected: 1 },
                { ptr: '/c%d', expected: 2 },
                { ptr: '/e^f', expected: 3 },
                { ptr: '/g|h', expected: 4 },
                { ptr: '/i\\j', expected: 5 },
                { ptr: '/k"l', expected: 6 },
                { ptr: '/ ', expected: 7 },
                { ptr: '/m~0n', expected: 8 },
            ].forEach((testcase) => expect(JSONPointer.get(doc, testcase.ptr)).equals(testcase.expected));
        }),

        new TestCase('JSONPointer.get() regression tests', () => {

            [
                { ptr: '/todo/done', doc: { todo: { task: 'x', done: false } }, expected: false },
            ].forEach((testcase) => expect(JSONPointer.get(testcase.doc, testcase.ptr)).equals(testcase.expected));

        }),

        new TestCase('JSONPointer.set() can set values', () => {

            const doc = { };

            JSONPointer.set(doc, '/foo', ['bar','bar']);
            JSONPointer.set(doc, '/foo/0', 'foo');
            JSONPointer.set(doc, '/foo/2', 'baz');
            JSONPointer.set(doc, '/path/to/freedom', 35);

            expect(doc.foo[0]).equals('foo');
            expect(doc.foo[1]).equals('bar');
            expect(doc.foo[2]).equals('baz');
            expect(doc.path.to.freedom).equals(35);

        }),

    ]),

    new TestSuite('TCTemplate', [

        new TestCase('renders a plain text template with the provided variables', () => {
            [
                { template: 'Hello, World!', locals: {}, output: 'Hello, World!' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('renders an HTML template with the provided variables without altering the HTML', () => {
            [
                { template: 'Hello, <em>Alice</em>!', locals: {}, output: 'Hello, <em>Alice</em>!' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('inserts variable values (escaped)', () => {
            [
                { template: '<span class="todo-[=/todo/done]">[=/todo/task]</span>', locals: { todo: { task: 'x', done: false } }, output: '<span class="todo-false">x</span>' },
                { template: 'Hello, [=/name]!', locals: { name: 'Bob' }, output: 'Hello, Bob!' },
                { template: '2 + 2 ? [=/x]!', locals: { x: true }, output: '2 + 2 ? true!' },
                { template: '[=/exp]', locals: { exp: '2 < 4' }, output: '2 &#60; 4' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('inserts variable values (unescaped)', () => {
            [
                { template: 'Hello, [-/name]!', locals: { name: 'Bob' }, output: 'Hello, Bob!' },
                { template: '[-/exp]', locals: { exp: '2 < 4' }, output: '2 < 4' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('interprets iteration', () => {
            [
                {
                    template: '[for /day in /daysofweek][=/day][if /exclaim]![/if] [/for]',
                    locals: {
                        exclaim: true,
                        daysofweek: [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                        ]
                    }, output: 'Sunday! Monday! Tuesday! Wednesday! Thursday! Friday! Saturday! ' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('interprets conditionals', () => {
            [
                { template: '[if /morning]Good Morning[/if]', locals: { morning: true }, output: 'Good Morning' },
                { template: '[if /morning]Good Morning[/if]', locals: { morning: false }, output: '' },
                { template: '[if /morning][if /good]Good [/if]Morning[/if]', locals: { morning: true, good: false }, output: 'Morning' },
                { template: '[if /foo]1[if /bar]2[if /baz]3[/if]4[/if]5[/if]', locals: { foo: true, bar: false, baz: true }, output: '15' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),

        new TestCase('does not output contents of [comment]...[/comment] blocks', () => {
            [
                { template: '[comment]this is a test[/comment]', locals: {}, output: '' },
                { template: 'Hello, [comment]this is a test[/comment]World!', locals: {}, output: 'Hello, World!' },
                { template: '[comment]this is a test[/comment]Hello, World!', locals: {}, output: 'Hello, World!' },
                { template: 'Hello, World![comment]this is a test[/comment]', locals: {}, output: 'Hello, World!' },
                { template: 'Hello, World![comment]this is a [comment]comment within a comment[/comment]!?!?![/comment]', locals: {}, output: 'Hello, World!' },
            ].forEach((testcase) => expect(new TCTemplate(testcase.template).render(testcase.locals)).equals(testcase.output));
        }),
    ]),

    new TestSuite('mtrand', [

        new TestCase('it should have the same output as the reference implementation for the same seed', () => {

            const output = [];
            const rng = mtrand(0xC0FFEE);
            for (let i = 0; i < 1000; i++) {
                output.push(rng.next().value);
            }

            const expected = [
                2460620404, 2359581913, 3501236071, 610817129, 3976498720, 2791287291,
                401964228, 2673530984, 1147449286, 146490663, 4125731687, 772585509,
                1476085526, 4080851215, 33584869, 3065293413, 3715390333, 3381496669,
                2509281293, 661918780, 2464791225, 4189052330, 1346991701, 1591262581,
                2056261082, 1750799660, 3503706338, 3069946550, 3559306495, 28010579,
                3212407698, 1085184525, 4218949801, 542582307, 950462925, 1210217525,
                2796041567, 3368513700, 4230113871, 2780166207, 3537963044, 3071496745,
                1063668378, 411755175, 1445854310, 221159525, 2982444780, 965033984,
                1893565259, 1736708874, 184860844, 2539851169, 3196127331, 3705154336,
                3548144554, 2088211055, 1416890703, 2043041767, 2731038641, 89027501,
                1095147693, 3902296596, 2443989002, 4149868103, 2459507682, 3496249317,
                1653330057, 2136913871, 1566787630, 1793107753, 1652568107, 3041200442,
                378328937, 729311526, 2366424682, 3431367246, 1679892149, 1069218744,
                1599485751, 4243580403, 1124835707, 27941550, 1199321560, 1999872013,
                1900437119, 3177068574, 3272514198, 1709666483, 2055614944, 2467916844,
                1200521336, 3393155088, 3692529534, 2912711753, 1469001423, 2331086068,
                3220098412, 1257751175, 2080639905, 1702509005, 4236873881, 3757083104,
                1057472364, 2494591951, 811030394, 1706549657, 2097781991, 96280787,
                3611439701, 907234845, 2450956087, 3744063933, 1949419293, 98081339,
                3300574034, 3836760378, 3774915187, 1256834426, 3329752357, 427534022,
                3367026875, 2544919224, 1864063519, 1157295502, 2593729706, 521248150,
                666372913, 601800132, 1184549136, 3049349985, 2064904949, 481923994,
                1617541298, 1048856997, 3898115343, 270470916, 539913667, 3295742924,
                2478520825, 3900002732, 2093013835, 1695892301, 2993938916, 4072115213,
                378126845, 2697883255, 1850342415, 324226062, 3565884012, 313095299, 553157011,
                3779788457, 849454867, 1789498490, 2986459766, 2077784118, 1166329629,
                394031538, 3675495664, 1525876813, 1386032491, 21354232, 1597903247,
                4228984159, 4281551743, 34396281, 3308968451, 2848551329, 1119431303, 9551020,
                3841975249, 4037285430, 2725039582, 1229314667, 3452499522, 3365602747,
                1465905653, 2867649810, 1243846656, 3695924144, 4042296880, 1713329743,
                1748676662, 2106297910, 1714336173, 2169928196, 2135082809, 842892941,
                1720787837, 2041848839, 1933017190, 3664498, 455453289, 4241705270, 2312187700,
                2531313163, 2099300637, 1723067734, 3558788251, 1793952825, 2641013767,
                2823827065, 1848779469, 1241933342, 3598690923, 3500222827, 2694162810,
                158629175, 2530505945, 3962361278, 4012677941, 2336410371, 3607362886,
                2091559250, 3246419503, 3260126415, 741999191, 3233410296, 2063338134,
                2799527158, 4079654331, 2282275109, 3904211922, 1979246484, 3301374852,
                1832597678, 297056323, 3976412053, 1984461763, 2278975063, 2325183002,
                3700262503, 1235660099, 4078210698, 207113149, 20642042, 2945589912, 326869860,
                2875475384, 524166087, 3141892828, 204656147, 2914459339, 3366837238,
                4141499436, 3514736548, 537338551, 980387675, 4163949814, 3951387428,
                1854301885, 1081010177, 458927923, 4085489501, 445828, 817961216, 1727297423,
                878711039, 2533390012, 2997430736, 2641318202, 738357258, 1873083330,
                3417485619, 1927905995, 3064688394, 4083257108, 367488300, 1261992187,
                3802249705, 2788473844, 543792581, 2481816713, 2076742561, 1815299820,
                2258359269, 376197861, 2346645150, 2105853038, 2706037805, 3947797854,
                1610617200, 3604587214, 1173913672, 1036187395, 1074049587, 4048170768,
                110463071, 3049286454, 804132961, 81320356, 1527792000, 2506456624, 4286468100,
                810159782, 1445641184, 428564759, 3861440245, 3384819780, 304057314,
                3988176355, 311269160, 491351013, 42666400, 730634956, 283144523, 129441564,
                26198145, 784385334, 3681755590, 292855991, 3616818908, 1413762420, 3103202388,
                2559810057, 1872039116, 4121214397, 1491689470, 1867679448, 2633529100,
                272954100, 2194542261, 4073775126, 2736313819, 3473883498, 133038238,
                146864117, 3623540883, 647704805, 3363000901, 2116474361, 1611173707,
                3960087771, 1200156465, 3574148755, 465041893, 2112515592, 2620958926,
                730467353, 3045797733, 4031734995, 3514015432, 1120035483, 1784776818,
                458289469, 2291271148, 3780714764, 2363588052, 344415172, 355680050,
                2071670190, 932458081, 3367130610, 249294370, 739697017, 3848404351,
                2633118436, 1014477336, 2040970106, 4013795820, 1441865385, 3006001322,
                3902186806, 1239830185, 750960293, 2421836235, 3052095099, 3162290923,
                859169881, 681406135, 1199351375, 3919066265, 1331203202, 3125467122,
                436480951, 552312604, 4033506997, 3666625314, 1914486599, 1711885502,
                4106529354, 3159030683, 3324501990, 1257075624, 1995988975, 808920859,
                3618588514, 3836552138, 679992960, 1413940468, 1087427321, 1205576666,
                2521483360, 2603783734, 3206343583, 3826763645, 1654748849, 845594305,
                227787523, 2869598824, 1307214019, 205332346, 2340203565, 1919425361,
                690034834, 17242006, 1512574421, 676489974, 1502516306, 3095979202, 2021757194,
                273796677, 764157199, 1427547314, 2844256742, 1205792946, 1424357869,
                1896587845, 3524411191, 280520734, 3585769675, 3085997170, 2144906232,
                2833992111, 2923449241, 2742008938, 1060955486, 2727477413, 2337861863,
                2176419724, 4180591862, 1301504338, 2018397675, 262486804, 3367446048,
                1195246626, 1705645703, 2645313463, 1504290690, 1725431397, 2237760011,
                851231476, 3274641732, 1396799239, 1538417975, 1248130040, 2595028150,
                3692933630, 3591275607, 599167014, 1512794599, 3181357592, 244092427,
                177461741, 3046832210, 1724747971, 2905498993, 3263226580, 1327938827,
                1881485642, 1825465919, 23284803, 1318339154, 3278861633, 2514622763,
                745907694, 1947002769, 3246696, 123039546, 527904350, 1151847208, 3662327046,
                2327862604, 4250980453, 1085228742, 1151345454, 692168454, 4074424843,
                2125431450, 1270137578, 1521333390, 3886155737, 2013866347, 2667125300,
                3468968108, 3292022350, 787336508, 966542021, 1239146018, 1272328718, 79113337,
                66929719, 3383027244, 2906828189, 2440780987, 4138310511, 773462495,
                1143653679, 3853647998, 590669676, 2560623498, 486675914, 2835339454,
                935318403, 2738428420, 3333386873, 867491642, 2936621860, 3921167075,
                4266169160, 189282981, 2724738946, 2213754033, 3670106150, 445753750,
                3481274164, 301787944, 1536194424, 1699032184, 406654638, 1366702812,
                642002216, 1892769152, 3446027591, 1962840850, 4199877975, 831597645,
                709095280, 3703781822, 2633614868, 2329012507, 3660540061, 184526654,
                2199296691, 2666235238, 2400615390, 523868718, 902704441, 2984639765,
                3952757240, 3866494890, 4012389226, 4259593069, 2768985018, 502599286,
                3094817290, 4017838961, 3440623927, 992552859, 162624696, 358739551,
                1926888338, 2547082751, 4105277977, 873868005, 6211882, 3797026196, 417584265,
                2051079446, 2241291916, 3783391125, 461410769, 1144183728, 1189003170,
                4169611940, 2233744521, 4077146658, 413351016, 1272681046, 3697635571,
                73120780, 2213866594, 508111983, 1792566851, 2302740489, 811767129, 2198591251,
                3056810856, 3352390740, 4212831082, 3849671024, 2430304249, 8344877, 739104973,
                3540914379, 2324319989, 386792199, 3666018483, 798977265, 4256244433,
                4156168579, 3349176360, 4283918816, 20876400, 3457771483, 2408635473,
                3105498614, 539476606, 1466934893, 3577241229, 3572746714, 2926044642,
                3611046182, 1827993606, 3580430659, 2240805328, 815587897, 2334641715,
                563370413, 2141384427, 1961985998, 1303686589, 3043940460, 1962244107,
                600404297, 851854814, 1712312699, 3266010499, 3111003714, 2931761021,
                2349452689, 3736324021, 2512933926, 1117161242, 2451232038, 95544430,
                3941535009, 549940273, 1025777475, 2434772768, 3147165240, 1314147296,
                2353341003, 1944709611, 3130174300, 768809009, 1552484971, 320822486,
                3448512415, 2368473911, 1646849323, 125166766, 2085529830, 2994010817,
                3997443126, 2021627215, 4238218934, 2210382197, 4044574423, 2061064282,
                4205382642, 1125751037, 1026818976, 2895871633, 2092543733, 2602830666,
                1297952302, 3094022940, 1251519367, 1285719715, 2196531461, 4075857563,
                1821422304, 980578166, 1476478243, 4024096895, 3758861520, 905696978,
                415420540, 3044013459, 2508839365, 1593571035, 1549483659, 2073053638,
                967701927, 3173932478, 1519748581, 3733986867, 4282523798, 3169892413,
                4261966025, 925586166, 1887932846, 2400716930, 1459956325, 1785160546,
                3131023980, 2048817248, 2336508468, 1866172140, 3849202893, 1351408203,
                1946397051, 598815666, 3368227489, 985984242, 4193212932, 10360251, 577726257,
                2381681183, 2957028486, 754218273, 1573006683, 1900029338, 3215246646,
                1179172192, 2033751456, 3728762987, 3248321970, 3711524941, 3816232059,
                387256632, 98495170, 2078725235, 3632193074, 532412942, 3503597456, 979640850,
                380601927, 4044966337, 1951574541, 3302932171, 2993638302, 344938798,
                3086328790, 649650602, 2770138455, 333389931, 1767295397, 1652187789,
                834927243, 380543146, 4262631898, 1147270038, 3798948815, 3331227750,
                3188222711, 2023768673, 4126721700, 2953664919, 3284008345, 380876171,
                1252119088, 4260998306, 2924821667, 1064619608, 2572790246, 2762364647,
                439693012, 979917697, 628963608, 3530881899, 3710145162, 3586051870,
                3398821206, 2783436707, 1453512320, 4199816127, 888845929, 2262242201,
                1585959414, 3034670255, 2266136647, 3895851280, 2932437941, 74083018,
                835607156, 2395479843, 2320092505, 3376567683, 1221797224, 2491018802,
                3502011685, 453274616, 1492995768, 547384621, 1710464192, 3375240119,
                1562243843, 2939035134, 1024369408, 715595802, 3867763623, 4264554349,
                919529823, 2657081137, 1281113178, 1424780375, 2546000444, 1343019609,
                1833192557, 398570529, 1535047003, 539977558, 3954061412, 3184307249,
                3182526491, 2048677964, 1478231062, 1183389063, 4213810402, 4174049583,
                45024059, 2664258861, 782158503, 3355303946, 2944023512, 2753481200,
                3865161334, 592194005, 166117759, 3472837586, 1301131208, 30141802, 3414150195,
                2081916483, 2006412944, 240709979, 3390278420, 595449289, 1328843846,
                3415310199, 3216915355, 1971843958, 1863772868, 1206177455, 3167648639,
                1774485796, 695024193, 3617345832, 2300356169, 210082759, 1192846886,
                2948627800, 4250465157, 2346104574, 5486123, 1316132745, 1071667141, 267224608,
                1609476390, 1286555844, 3040700297, 2083323659, 3293679911, 997819384,
                949398091, 3137185846, 3791778848, 1861150769, 716834875, 3912420484,
                4122121023, 3603199741, 3953186634, 2324361460, 275985109, 2848704058,
                1196300540, 2375331528, 2508746542, 1941242796, 3972807282, 2200614597,
                2816570022, 3694214634, 4143079719, 3644083944, 2282016335, 816972546,
                994490660, 3591529438, 3642332669, 215319651, 746492424, 422934892, 4204651733,
                2762927800, 1474465298, 1108355056, 3687330934, 203736684, 3979659507, 6995475,
                2922358465, 431829714, 2461967627, 1546745987, 1402131162, 842075566,
                3364947949, 1721389791, 2351277353, 2209485835, 2954739149, 1019723917,
                258620466, 2319059161, 4090085695, 95390592, 4107745379, 4094478984,
                1819160081, 3206839110, 2030680612, 1402292566, 2432066414, 2576415903,
                508364086, 1249710968, 1963757178, 4281067396, 1533805165, 287970561,
                3918472742, 1449885122, 3782919761, 4294313521, 1173112303, 1960096509,
                3972141585, 3634493418, 1601719151, 2776300207, 3180377085, 2008861150,
                1441641809, 1566581584, 2194151639, 2116576208, 1188570564, 2199411091,
                1621798556, 3084569837, 4111589930, 3643519908, 1372774915, 595972881,
                3192917492, 445533493, 372166570, 3648836084, 2869176049, 2003843330,
                566768250, 3222937714, 448424167, 1567428950, 985200800, 981571406, 2705764067,
                3311555346, 3305463081, 1009155944, 1886705196, 3680660429, 4169136876,
                2666978727, 509134938, 2594976133, 4050643253, 1816553464, 604360014,
                2752652632, 2702790924, 3646020699, 1215141498, 93993709, 3655151869,
                1078659239, 490067886, 2519880129, 2310911516, 1794606588, 2093663607,
                656323256, 3189062685, 2556341031, 3803004046, 4209583509, 3416367634,
                1730489658, 2879318181, 2541565533, 3269736170, 609196301, 1965322, 519834411,
                142288935, 3371864884, 2669073186, 4183078680, 1738486070, 2103735958,
                1525999066, 315290067, 3084218006, 318881230, 3362958954, 32486575,
            ];

            for (let i = 0; i < expected.length; i++) {
                expect(output[i]).equals(expected[i]);
            }
        }),

    ]),

    new TestSuite('CombUUID', [

        new TestCase('CombUUID.encode(now = new Date()) returns a string', () => {
            expect(CombUUID.encode()).toHaveType('string');
        }),

        new TestCase('CombUUID.encode(now = new Date()) returns 36 characters', () => {
            expect(CombUUID.encode()).toHaveLength(36);
        }),

        new TestCase('CombUUID.encode(now = new Date()) returns a version 4 UUID', () => {
            expect(CombUUID.encode()).matches(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        }),

        new TestCase('CombUUID.encode(now = new Date()) returns a variant b UUID', () => {
            expect(CombUUID.encode()).matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-b[0-9a-f]{3}-[0-9a-f]{12}$/);
        }),

        new TestCase('CombUUID.encode(now = new Date()) timestamp parameter matches encoded timestamp in UUID', () => {
            expect(CombUUID.encode(1578422706217)).matches(/8f8e8478/);
        }),

    ]),

]).execute(new ConsoleTestReporter());
