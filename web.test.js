"use strict";
function require( path ){ return $node[ path ] };
"use strict";
var $;
(function ($_1) {
    function $mol_test(set) {
        for (let name in set) {
            const code = set[name];
            const test = (typeof code === 'string') ? new Function('', code) : code;
            $_1.$mol_test_all.push(test);
        }
        $mol_test_schedule();
    }
    $_1.$mol_test = $mol_test;
    $_1.$mol_test_mocks = [];
    $_1.$mol_test_all = [];
    async function $mol_test_run() {
        for (var test of $_1.$mol_test_all) {
            let context = Object.create($$);
            for (let mock of $_1.$mol_test_mocks)
                await mock(context);
            const res = test(context);
            if ($mol_promise_like(res)) {
                await new Promise((done, fail) => {
                    res.then(done, fail);
                    setTimeout(() => fail(new Error('Test timeout: ' + test.name)), 1000);
                });
            }
        }
        $$.$mol_log3_done({
            place: '$mol_test',
            message: 'All tests passed',
            count: $_1.$mol_test_all.length,
        });
    }
    $_1.$mol_test_run = $mol_test_run;
    let scheduled = false;
    function $mol_test_schedule() {
        if (scheduled)
            return;
        scheduled = true;
        setTimeout(async () => {
            scheduled = false;
            await $mol_test_run();
            $$.$mol_test_complete();
        }, 1000);
    }
    $_1.$mol_test_schedule = $mol_test_schedule;
    $_1.$mol_test_mocks.push(context => {
        let seed = 0;
        context.Math = Object.create(Math);
        context.Math.random = () => Math.sin(seed++);
        const forbidden = ['XMLHttpRequest', 'fetch'];
        for (let api of forbidden) {
            context[api] = new Proxy(function () { }, {
                get() {
                    $mol_fail_hidden(new Error(`${api} is forbidden in tests`));
                },
                apply() {
                    $mol_fail_hidden(new Error(`${api} is forbidden in tests`));
                },
            });
        }
    });
    $mol_test({
        'mocked Math.random'($) {
            console.assert($.Math.random() === 0);
            console.assert($.Math.random() === Math.sin(1));
        },
        'forbidden XMLHttpRequest'($) {
            try {
                console.assert(void new $.XMLHttpRequest);
            }
            catch (error) {
                console.assert(error.message === 'XMLHttpRequest is forbidden in tests');
            }
        },
        'forbidden fetch'($) {
            try {
                console.assert(void $.fetch(''));
            }
            catch (error) {
                console.assert(error.message === 'fetch is forbidden in tests');
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function $mol_test_complete() {
    }
    $.$mol_test_complete = $mol_test_complete;
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";

;
"use strict";
/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
var $;
(function ($) {
    $mol_test({
        'Make empty div'() {
            $mol_assert_equal(($mol_jsx("div", null)).outerHTML, '<div></div>');
        },
        'Define native field'() {
            const dom = $mol_jsx("input", { value: '123' });
            $mol_assert_equal(dom.outerHTML, '<input value="123">');
            $mol_assert_equal(dom.value, '123');
        },
        'Define classes'() {
            const dom = $mol_jsx("div", { class: 'foo bar' });
            $mol_assert_equal(dom.outerHTML, '<div class="foo bar"></div>');
        },
        'Define styles'() {
            const dom = $mol_jsx("div", { style: { color: 'red' } });
            $mol_assert_equal(dom.outerHTML, '<div style="color: red;"></div>');
        },
        'Define dataset'() {
            const dom = $mol_jsx("div", { dataset: { foo: 'bar' } });
            $mol_assert_equal(dom.outerHTML, '<div data-foo="bar"></div>');
        },
        'Define attributes'() {
            const dom = $mol_jsx("div", { lang: "ru", hidden: true });
            $mol_assert_equal(dom.outerHTML, '<div lang="ru" hidden=""></div>');
        },
        'Define child nodes'() {
            const dom = $mol_jsx("div", null,
                "hello",
                $mol_jsx("strong", null, "world"),
                "!");
            $mol_assert_equal(dom.outerHTML, '<div>hello<strong>world</strong>!</div>');
        },
        'Make fragment'() {
            const dom = $mol_jsx($mol_jsx_frag, null,
                $mol_jsx("br", null),
                $mol_jsx("hr", null));
            $mol_assert_equal($mol_dom_serialize(dom), '<br xmlns="http://www.w3.org/1999/xhtml" /><hr xmlns="http://www.w3.org/1999/xhtml" />');
        },
        'Spread fragment'() {
            const dom = $mol_jsx("div", null,
                $mol_jsx($mol_jsx_frag, null,
                    $mol_jsx("br", null),
                    $mol_jsx("hr", null)));
            $mol_assert_equal(dom.outerHTML, '<div><br><hr></div>');
        },
        'Function as component'() {
            const Button = (props, target) => {
                return $mol_jsx("button", { title: props.hint }, target());
            };
            const dom = $mol_jsx(Button, { id: "foo", hint: "click me" }, () => 'hey!');
            $mol_assert_equal(dom.outerHTML, '<button id="foo" title="click me" class="Button">hey!</button>');
        },
        'Nested guid generation'() {
            const Foo = () => {
                return $mol_jsx("div", null,
                    $mol_jsx(Bar, { id: "bar" },
                        $mol_jsx("img", { id: "icon" })));
            };
            const Bar = (props, icon) => {
                return $mol_jsx("span", null,
                    icon,
                    $mol_jsx("i", { id: "label" }));
            };
            const dom = $mol_jsx(Foo, { id: "foo" });
            $mol_assert_equal(dom.outerHTML, '<div id="foo" class="Foo"><span id="foo/bar" class="Foo_bar Bar"><img id="foo/icon" class="Foo_icon"><i id="foo/bar/label" class="Foo_bar_label Bar_label"></i></span></div>');
        },
        'Fail on non unique ids'() {
            const App = () => {
                return $mol_jsx("div", null,
                    $mol_jsx("span", { id: "bar" }),
                    $mol_jsx("span", { id: "bar" }));
            };
            $mol_assert_fail(() => $mol_jsx(App, { id: "foo" }), 'JSX already has tag with id "foo/bar"');
        },
        'Owner based guid generationn'() {
            const Foo = () => {
                return $mol_jsx("div", null,
                    $mol_jsx(Bar, { id: "middle", icon: () => $mol_jsx("img", { id: "icon" }) }));
            };
            const Bar = (props) => {
                return $mol_jsx("span", null, props.icon());
            };
            const dom = $mol_jsx(Foo, { id: "app" });
            $mol_assert_equal(dom.outerHTML, '<div id="app" class="Foo"><span id="app/middle" class="Foo_middle Bar"><img id="app/icon" class="Foo_icon"></span></div>');
        },
        'Fail on same ids from different caller'() {
            const Foo = () => {
                return $mol_jsx("div", null,
                    $mol_jsx("img", { id: "icon" }),
                    $mol_jsx(Bar, { id: "bar", icon: () => $mol_jsx("img", { id: "icon" }) }));
            };
            const Bar = (props) => {
                return $mol_jsx("span", null, props.icon());
            };
            $mol_assert_fail(() => $mol_jsx(Foo, { id: "foo" }), 'JSX already has tag with id "foo/icon"');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Lazy computed lists with native Array interface. $mol_range2_array is mutable but all derived ranges are immutable. */
    function $mol_range2(item = index => index, size = () => Number.POSITIVE_INFINITY) {
        const source = typeof item === 'function' ? new $mol_range2_array() : item;
        if (typeof item !== 'function') {
            item = index => source[index];
            size = () => source.length;
        }
        return new Proxy(source, {
            get(target, field) {
                if (typeof field === 'string') {
                    if (field === 'length')
                        return size();
                    const index = Number(field);
                    if (index < 0)
                        return undefined;
                    if (index >= size())
                        return undefined;
                    if (index === Math.trunc(index))
                        return item(index);
                }
                return $mol_range2_array.prototype[field];
            },
            set(target, field) {
                return $mol_fail(new TypeError(`Lazy range is read only (trying to set field ${JSON.stringify(field)})`));
            },
            ownKeys(target) {
                return [...Array(size())].map((v, i) => String(i)).concat('length');
            },
            getOwnPropertyDescriptor(target, field) {
                if (field === "length")
                    return {
                        value: size(),
                        writable: true,
                        enumerable: false,
                        configurable: false,
                    };
                const index = Number(field);
                if (index === Math.trunc(index))
                    return {
                        get: () => this.get(target, field, this),
                        enumerable: true,
                        configurable: true,
                    };
                return Object.getOwnPropertyDescriptor(target, field);
            }
        });
    }
    $.$mol_range2 = $mol_range2;
    class $mol_range2_array extends Array {
        // Lazy
        concat(...tail) {
            if (tail.length === 0)
                return this;
            if (tail.length > 1) {
                let list = this;
                for (let item of tail)
                    list = list.concat(item);
                return list;
            }
            return $mol_range2(index => index < this.length ? this[index] : tail[0][index - this.length], () => this.length + tail[0].length);
        }
        // Lazy
        filter(check, context) {
            const filtered = [];
            let cursor = -1;
            return $mol_range2(index => {
                while (cursor < this.length && index >= filtered.length - 1) {
                    const val = this[++cursor];
                    if (check(val, cursor, this))
                        filtered.push(val);
                }
                return filtered[index];
            }, () => cursor < this.length ? Number.POSITIVE_INFINITY : filtered.length);
        }
        // Diligent
        forEach(proceed, context) {
            for (let [key, value] of this.entries())
                proceed.call(context, value, key, this);
        }
        // Lazy
        map(proceed, context) {
            return $mol_range2(index => proceed.call(context, this[index], index, this), () => this.length);
        }
        // Diligent
        reduce(merge, result) {
            let index = 0;
            if (arguments.length === 1) {
                result = this[index++];
            }
            for (; index < this.length; ++index) {
                result = merge(result, this[index], index, this);
            }
            return result;
        }
        // Lazy
        toReversed() {
            return $mol_range2(index => this[this.length - 1 - index], () => this.length);
        }
        // Lazy
        slice(from = 0, to = this.length) {
            return $mol_range2(index => this[from + index], () => Math.min(to, this.length) - from);
        }
        // Lazy
        some(check, context) {
            for (let index = 0; index < this.length; ++index) {
                if (check.call(context, this[index], index, this))
                    return true;
            }
            return false;
        }
        every(check, context) {
            for (let index = 0; index < this.length; ++index) {
                if (!check.call(context, this[index], index, this))
                    return false;
            }
            return true;
        }
        reverse() {
            return $mol_fail(new TypeError(`Mutable reverse is forbidden. Use toReversed instead.`));
        }
        sort() {
            return $mol_fail(new TypeError(`Mutable sort is forbidden. Use toSorted instead.`));
        }
        indexOf(needle) {
            return this.findIndex(item => item === needle);
        }
        [Symbol.toPrimitive]() {
            return $mol_guid();
        }
    }
    $.$mol_range2_array = $mol_range2_array;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'lazy calls'() {
            let calls = 0;
            const list = $mol_range2(index => (++calls, index), () => 10);
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 10);
            $mol_assert_equal(list[-1], undefined);
            $mol_assert_equal(list[0], 0);
            $mol_assert_equal(list[9], 9);
            $mol_assert_equal(list[9.5], undefined);
            $mol_assert_equal(list[10], undefined);
            $mol_assert_equal(calls, 2);
        },
        'infinity list'() {
            let calls = 0;
            const list = $mol_range2(index => (++calls, index));
            $mol_assert_equal(list.length, Number.POSITIVE_INFINITY);
            $mol_assert_equal(list[0], 0);
            $mol_assert_equal(list[4], 4);
            $mol_assert_equal(list[Number.MAX_SAFE_INTEGER], Number.MAX_SAFE_INTEGER);
            $mol_assert_equal(list[Number.POSITIVE_INFINITY], undefined);
            $mol_assert_equal(calls, 3);
        },
        'stringify'() {
            const list = $mol_range2(i => i, () => 5);
            $mol_assert_equal(list.toString(), '0,1,2,3,4');
            $mol_assert_equal(list.join(';'), '0;1;2;3;4');
        },
        'for-of'() {
            let log = '';
            for (let i of $mol_range2(i => i + 1, () => 5)) {
                log += i;
            }
            $mol_assert_equal(log, '12345');
        },
        'for-in'() {
            let log = '';
            for (let i in $mol_range2(i => i, () => 5)) {
                log += i;
            }
            $mol_assert_equal(log, '01234');
        },
        'forEach'() {
            let log = '';
            $mol_range2(i => i, () => 5).forEach(i => log += i);
            $mol_assert_equal(log, '01234');
        },
        'reduce'() {
            let calls = 0;
            const list = $mol_range2().slice(1, 6);
            $mol_assert_equal(list.reduce((s, v) => s + v), 15);
            $mol_assert_equal(list.reduce((s, v) => s + v, 5), 20);
        },
        'lazy concat'() {
            let calls1 = 0;
            let calls2 = 0;
            const list = $mol_range2(index => (++calls1, index), () => 5).concat([0, 1, 2, 3, 4], $mol_range2(index => (++calls2, index), () => 5));
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 15);
            $mol_assert_equal(list[0], 0);
            $mol_assert_equal(list[4], 4);
            $mol_assert_equal(list[5], 0);
            $mol_assert_equal(list[9], 4);
            $mol_assert_equal(list[10], 0);
            $mol_assert_equal(list[14], 4);
            $mol_assert_equal(list[15], undefined);
            $mol_assert_equal(calls1, 2);
            $mol_assert_equal(calls2, 2);
        },
        'lazy filter'() {
            let calls = 0;
            const list = $mol_range2(index => (++calls, index), () => 15).filter(v => v % 2).slice(0, 3);
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 3);
            $mol_assert_equal(list[0], 1);
            $mol_assert_equal(list[2], 5);
            $mol_assert_equal(list[3], undefined);
            $mol_assert_equal(calls, 8);
        },
        'lazy reverse'() {
            let calls = 0;
            const list = $mol_range2(index => (++calls, index), () => 10).toReversed().slice(0, 3);
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 3);
            $mol_assert_equal(list[0], 9);
            $mol_assert_equal(list[2], 7);
            $mol_assert_equal(list[3], undefined);
            $mol_assert_equal(calls, 2);
        },
        'lazy map'() {
            let calls1 = 0;
            let calls2 = 0;
            const source = $mol_range2(index => (++calls1, index), () => 5);
            const target = source.map((item, index, self) => {
                ++calls2;
                $mol_assert_equal(source, self);
                return index + 10;
            }, () => 5);
            $mol_assert_equal(true, target instanceof Array);
            $mol_assert_equal(target.length, 5);
            $mol_assert_equal(target[0], 10);
            $mol_assert_equal(target[4], 14);
            $mol_assert_equal(target[5], undefined);
            $mol_assert_equal(calls1, 2);
            $mol_assert_equal(calls2, 2);
        },
        'lazy slice'() {
            let calls = 0;
            const list = $mol_range2(index => (++calls, index), () => 10).slice(3, 7);
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 4);
            $mol_assert_equal(list[0], 3);
            $mol_assert_equal(list[3], 6);
            $mol_assert_equal(list[4], undefined);
            $mol_assert_equal(calls, 2);
        },
        'lazy some'() {
            let calls = 0;
            $mol_assert_equal(true, $mol_range2(index => (++calls, index), () => 5).some(v => v >= 2));
            $mol_assert_equal(calls, 3);
            $mol_assert_equal(false, $mol_range2(i => i, () => 0).some(v => true));
            $mol_assert_equal(true, $mol_range2(i => i).some(v => v > 5));
        },
        'lazy every'() {
            let calls = 0;
            $mol_assert_equal(false, $mol_range2(index => (++calls, index), () => 5).every(v => v < 2));
            $mol_assert_equal(calls, 3);
            $mol_assert_equal(true, $mol_range2(i => i, () => 0).every(v => false));
            $mol_assert_equal(false, $mol_range2(i => i).every(v => v < 5));
        },
        'lazyfy'() {
            let calls = 0;
            const list = $mol_range2([0, 1, 2, 3, 4, 5]).map(i => (++calls, i + 10)).slice(2);
            $mol_assert_equal(true, list instanceof Array);
            $mol_assert_equal(list.length, 4);
            $mol_assert_equal(calls, 0);
            $mol_assert_equal(list[0], 12);
            $mol_assert_equal(list[3], 15);
            $mol_assert_equal(list[4], undefined);
            $mol_assert_equal(calls, 2);
        },
        'prevent modification'() {
            const list = $mol_range2(i => i, () => 5);
            $mol_assert_fail(() => list.push(4), TypeError);
            $mol_assert_fail(() => list.pop(), TypeError);
            $mol_assert_fail(() => list.unshift(4), TypeError);
            $mol_assert_fail(() => list.shift(), TypeError);
            $mol_assert_fail(() => list.splice(1, 2), TypeError);
            $mol_assert_fail(() => list[1] = 2, TypeError);
            $mol_assert_fail(() => list.reverse(), TypeError);
            $mol_assert_fail(() => list.sort(), TypeError);
            $mol_assert_equal(list.toString(), '0,1,2,3,4');
        }
    });
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($) {
    $mol_test({
        'nulls & undefineds'() {
            $mol_assert_ok($mol_compare_deep(null, null));
            $mol_assert_ok($mol_compare_deep(undefined, undefined));
            $mol_assert_not($mol_compare_deep(undefined, null));
            $mol_assert_not($mol_compare_deep({}, null));
        },
        'number'() {
            $mol_assert_ok($mol_compare_deep(1, 1));
            $mol_assert_ok($mol_compare_deep(Number.NaN, Number.NaN));
            $mol_assert_not($mol_compare_deep(1, 2));
            $mol_assert_ok($mol_compare_deep(Object(1), Object(1)));
            $mol_assert_not($mol_compare_deep(Object(1), Object(2)));
        },
        'POJO'() {
            $mol_assert_ok($mol_compare_deep({}, {}));
            $mol_assert_not($mol_compare_deep({ a: 1 }, { b: 2 }));
            $mol_assert_not($mol_compare_deep({ a: 1 }, { a: 2 }));
            $mol_assert_not($mol_compare_deep({}, { a: undefined }));
            $mol_assert_not($mol_compare_deep({ a: 1, b: 2 }, { b: 2, a: 1 }));
            $mol_assert_ok($mol_compare_deep({ a: { b: 1 } }, { a: { b: 1 } }));
            $mol_assert_ok($mol_compare_deep(Object.create(null), Object.create(null)));
        },
        'Array'() {
            $mol_assert_ok($mol_compare_deep([], []));
            $mol_assert_ok($mol_compare_deep([1, [2]], [1, [2]]));
            $mol_assert_not($mol_compare_deep([1, 2], [1, 3]));
            $mol_assert_not($mol_compare_deep([1, 2,], [1, 3, undefined]));
            $mol_assert_not($mol_compare_deep($mol_range2().slice(0, 0), new Array()));
            $mol_assert_not($mol_compare_deep($mol_range2(), $mol_range2()));
        },
        'Non POJO are different'() {
            class Thing extends Object {
            }
            $mol_assert_not($mol_compare_deep(new Thing, new Thing));
            $mol_assert_not($mol_compare_deep(() => 1, () => 1));
            $mol_assert_not($mol_compare_deep(new RangeError('Test error'), new RangeError('Test error')));
        },
        'POJO with symbols'() {
            const sym = Symbol();
            $mol_assert_ok($mol_compare_deep({ [sym]: true }, { [sym]: true }));
            $mol_assert_not($mol_compare_deep({ [Symbol()]: true }, { [Symbol()]: true }));
        },
        'same POJOs with cyclic reference'() {
            const a = { foo: {} };
            a['self'] = a;
            const b = { foo: {} };
            b['self'] = b;
            $mol_assert_ok($mol_compare_deep(a, b));
        },
        'same POJOs with cyclic reference with cache warmup'() {
            const obj1 = { test: 1, obj3: null };
            const obj1_copy = { test: 1, obj3: null };
            const obj2 = { test: 2, obj1 };
            const obj2_copy = { test: 2, obj1: obj1_copy };
            const obj3 = { test: 3, obj2 };
            const obj3_copy = { test: 3, obj2: obj2_copy };
            obj1.obj3 = obj3;
            obj1_copy.obj3 = obj3_copy;
            // warmup cache
            $mol_assert_not($mol_compare_deep(obj1, {}));
            $mol_assert_not($mol_compare_deep(obj2, {}));
            $mol_assert_not($mol_compare_deep(obj3, {}));
            $mol_assert_ok($mol_compare_deep(obj3, obj3_copy));
        },
        'Date'() {
            $mol_assert_ok($mol_compare_deep(new Date(12345), new Date(12345)));
            $mol_assert_not($mol_compare_deep(new Date(12345), new Date(12346)));
        },
        'RegExp'() {
            $mol_assert_ok($mol_compare_deep(/\x22/mig, /\x22/mig));
            $mol_assert_not($mol_compare_deep(/\x22/mig, /\x21/mig));
            $mol_assert_not($mol_compare_deep(/\x22/mig, /\x22/mg));
        },
        'Error'() {
            $mol_assert_not($mol_compare_deep(new Error('xxx'), new Error('xxx')));
            const fail = (message) => new Error(message);
            $mol_assert_ok($mol_compare_deep(...['xxx', 'xxx'].map(msg => new Error(msg))));
            $mol_assert_not($mol_compare_deep(...['xxx', 'yyy'].map(msg => new Error(msg))));
        },
        'Map'() {
            $mol_assert_ok($mol_compare_deep(new Map, new Map));
            $mol_assert_ok($mol_compare_deep(new Map([[1, [2]]]), new Map([[1, [2]]])));
            $mol_assert_ok($mol_compare_deep(new Map([[[1], 2]]), new Map([[[1], 2]])));
            $mol_assert_not($mol_compare_deep(new Map([[1, 2]]), new Map([[1, 3]])));
            $mol_assert_not($mol_compare_deep(new Map([[[1], 2]]), new Map([[[3], 2]])));
        },
        'Set'() {
            $mol_assert_ok($mol_compare_deep(new Set, new Set));
            $mol_assert_ok($mol_compare_deep(new Set([1, [2]]), new Set([1, [2]])));
            $mol_assert_not($mol_compare_deep(new Set([1]), new Set([2])));
        },
        'Uint8Array'() {
            $mol_assert_ok($mol_compare_deep(new Uint8Array, new Uint8Array));
            $mol_assert_ok($mol_compare_deep(new Uint8Array([0]), new Uint8Array([0])));
            $mol_assert_not($mol_compare_deep(new Uint8Array([0]), new Uint8Array([1])));
        },
        'DataView'() {
            $mol_assert_ok($mol_compare_deep(new DataView(new Uint8Array().buffer), new DataView(new Uint8Array().buffer)));
            $mol_assert_ok($mol_compare_deep(new DataView(new Uint8Array([0]).buffer), new DataView(new Uint8Array([0]).buffer)));
            $mol_assert_not($mol_compare_deep(new DataView(new Uint8Array([0]).buffer), new DataView(new Uint8Array([1]).buffer)));
        },
        'Serializale'() {
            class User {
                name;
                rand;
                constructor(name, rand = Math.random()) {
                    this.name = name;
                    this.rand = rand;
                }
                [Symbol.toPrimitive](mode) {
                    return this.name;
                }
            }
            $mol_assert_ok($mol_compare_deep(new User('Jin'), new User('Jin')));
            $mol_assert_not($mol_compare_deep(new User('Jin'), new User('John')));
        },
        'Iterable'() {
            $mol_assert_ok($mol_compare_deep(new URLSearchParams({ foo: 'bar' }), new URLSearchParams({ foo: 'bar' })));
            $mol_assert_not($mol_compare_deep(new URLSearchParams({ foo: 'xxx' }), new URLSearchParams({ foo: 'yyy' })));
            $mol_assert_not($mol_compare_deep(new URLSearchParams({ foo: 'xxx', bar: 'yyy' }), new URLSearchParams({ bar: 'yyy', foo: 'xxx' })));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Argument must be Truthy
     * @deprecated use $mol_assert_equal instead
     */
    function $mol_assert_ok(value) {
        if (value)
            return;
        $mol_fail(new Error(`${value} ≠ true`));
    }
    $.$mol_assert_ok = $mol_assert_ok;
    /**
     * Argument must be Falsy
     * @deprecated use $mol_assert_equal instead
     */
    function $mol_assert_not(value) {
        if (!value)
            return;
        $mol_fail(new Error(`${value} ≠ false`));
    }
    $.$mol_assert_not = $mol_assert_not;
    /**
     * Handler must throw an error.
     * @example
     * $mol_assert_fail( ()=>{ throw new Error( 'Parse error' ) } ) // Passes because throws error
     * $mol_assert_fail( ()=>{ throw new Error( 'Parse error' ) } , 'Parse error' ) // Passes because throws right message
     * $mol_assert_fail( ()=>{ throw new Error( 'Parse error' ) } , Error ) // Passes because throws right class
     * @see https://mol.hyoo.ru/#!section=docs/=9q9dv3_fgxjsf
     */
    function $mol_assert_fail(handler, ErrorRight) {
        const fail = $.$mol_fail;
        try {
            $.$mol_fail = $.$mol_fail_hidden;
            handler();
        }
        catch (error) {
            $.$mol_fail = fail;
            if (typeof ErrorRight === 'string') {
                $mol_assert_equal(error.message ?? error, ErrorRight);
            }
            else {
                $mol_assert_equal(error instanceof ErrorRight, true);
            }
            return error;
        }
        finally {
            $.$mol_fail = fail;
        }
        $mol_fail(new Error('Not failed', { cause: { expect: ErrorRight } }));
    }
    $.$mol_assert_fail = $mol_assert_fail;
    /** @deprecated Use $mol_assert_equal */
    function $mol_assert_like(...args) {
        $mol_assert_equal(...args);
    }
    $.$mol_assert_like = $mol_assert_like;
    /**
     * All arguments must not be structural equal to each other.
     * @example
     * $mol_assert_unique( 1 , 2 , 3 ) // Passes
     * $mol_assert_unique( 1 , 1 , 2 ) // Fails because 1 === 1
     * @see https://mol.hyoo.ru/#!section=docs/=9q9dv3_fgxjsf
     */
    function $mol_assert_unique(...args) {
        for (let i = 0; i < args.length; ++i) {
            for (let j = 0; j < args.length; ++j) {
                if (i === j)
                    continue;
                if (!$mol_compare_deep(args[i], args[j]))
                    continue;
                return $mol_fail(new Error(`Uniquesess assertion failure`, { cause: { [i]: args[i], [i]: args[i] } }));
            }
        }
    }
    $.$mol_assert_unique = $mol_assert_unique;
    /**
     * All arguments must be structural equal each other.
     * @example
     * $mol_assert_like( [1] , [1] , [1] ) // Passes
     * $mol_assert_like( [1] , [1] , [2] ) // Fails because 1 !== 2
     * @see https://mol.hyoo.ru/#!section=docs/=9q9dv3_fgxjsf
     */
    function $mol_assert_equal(...args) {
        for (let i = 1; i < args.length; ++i) {
            if ($mol_compare_deep(args[0], args[i]))
                continue;
            return $mol_fail(new Error(`Equality assertion failure`, { cause: { 0: args[0], [i]: args[i] } }));
        }
    }
    $.$mol_assert_equal = $mol_assert_equal;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'must be false'() {
            $mol_assert_not(0);
        },
        'must be true'() {
            $mol_assert_ok(1);
        },
        'two must be equal'() {
            $mol_assert_equal(2, 2);
        },
        'three must be equal'() {
            $mol_assert_equal(2, 2, 2);
        },
        'two must be unique'() {
            $mol_assert_unique([2], [3]);
        },
        'three must be unique'() {
            $mol_assert_unique([1], [2], [3]);
        },
        'two must be alike'() {
            $mol_assert_equal([3], [3]);
        },
        'three must be alike'() {
            $mol_assert_equal([3], [3], [3]);
        },
        'two object must be alike'() {
            $mol_assert_equal({ a: 1 }, { a: 1 });
        },
        'three object must be alike'() {
            $mol_assert_equal({ a: 1 }, { a: 1 }, { a: 1 });
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'FQN of anon function'($) {
            const $$ = Object.assign($, { $mol_func_name_test: (() => () => { })() });
            $mol_assert_equal($$.$mol_func_name_test.name, '');
            $mol_assert_equal($$.$mol_func_name($$.$mol_func_name_test), '$mol_func_name_test');
            $mol_assert_equal($$.$mol_func_name_test.name, '$mol_func_name_test');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Collect deps'() {
            const pub1 = new $mol_wire_pub;
            const pub2 = new $mol_wire_pub;
            const sub = new $mol_wire_pub_sub;
            const bu1 = sub.track_on();
            try {
                pub1.promote();
                pub2.promote();
                pub2.promote();
            }
            finally {
                sub.track_cut();
                sub.track_off(bu1);
            }
            pub1.emit();
            pub2.emit();
            $mol_assert_like(sub.pub_list, [pub1, pub2, pub2]);
            const bu2 = sub.track_on();
            try {
                pub1.promote();
                pub1.promote();
                pub2.promote();
            }
            finally {
                sub.track_cut();
                sub.track_off(bu2);
            }
            pub1.emit();
            pub2.emit();
            $mol_assert_like(sub.pub_list, [pub1, pub1, pub2]);
        },
        'cyclic detection'($) {
            const sub1 = new $mol_wire_pub_sub;
            const sub2 = new $mol_wire_pub_sub;
            const bu1 = sub1.track_on();
            try {
                const bu2 = sub2.track_on();
                try {
                    $mol_assert_fail(() => sub1.promote(), 'Circular subscription');
                }
                finally {
                    sub2.track_cut();
                    sub2.track_off(bu2);
                }
            }
            finally {
                sub1.track_cut();
                sub1.track_off(bu1);
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'get'() {
            const proxy = $mol_delegate({}, () => ({ foo: 777 }));
            $mol_assert_equal(proxy.foo, 777);
        },
        'has'() {
            const proxy = $mol_delegate({}, () => ({ foo: 777 }));
            $mol_assert_equal('foo' in proxy, true);
        },
        'set'() {
            const target = { foo: 777 };
            const proxy = $mol_delegate({}, () => target);
            proxy.foo = 123;
            $mol_assert_equal(target.foo, 123);
        },
        'getOwnPropertyDescriptor'() {
            const proxy = $mol_delegate({}, () => ({ foo: 777 }));
            $mol_assert_like(Object.getOwnPropertyDescriptor(proxy, 'foo'), {
                value: 777,
                writable: true,
                enumerable: true,
                configurable: true,
            });
        },
        'ownKeys'() {
            const proxy = $mol_delegate({}, () => ({ foo: 777, [Symbol.toStringTag]: 'bar' }));
            $mol_assert_like(Reflect.ownKeys(proxy), ['foo', Symbol.toStringTag]);
        },
        'getPrototypeOf'() {
            class Foo {
            }
            const proxy = $mol_delegate({}, () => new Foo);
            $mol_assert_equal(Object.getPrototypeOf(proxy), Foo.prototype);
        },
        'setPrototypeOf'() {
            class Foo {
            }
            const target = {};
            const proxy = $mol_delegate({}, () => target);
            Object.setPrototypeOf(proxy, Foo.prototype);
            $mol_assert_equal(Object.getPrototypeOf(target), Foo.prototype);
        },
        'instanceof'() {
            class Foo {
            }
            const proxy = $mol_delegate({}, () => new Foo);
            $mol_assert_ok(proxy instanceof Foo);
            $mol_assert_ok(proxy instanceof $mol_delegate);
        },
        'autobind'() {
            class Foo {
            }
            const proxy = $mol_delegate({}, () => new Foo);
            $mol_assert_ok(proxy instanceof Foo);
            $mol_assert_ok(proxy instanceof $mol_delegate);
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    /// @todo right orderinng
    $.$mol_after_mock_queue = [];
    function $mol_after_mock_warp() {
        const queue = $.$mol_after_mock_queue.splice(0);
        for (const task of queue)
            task();
    }
    $.$mol_after_mock_warp = $mol_after_mock_warp;
    class $mol_after_mock_commmon extends $mol_object2 {
        task;
        promise = Promise.resolve();
        cancelled = false;
        id;
        constructor(task) {
            super();
            this.task = task;
            $.$mol_after_mock_queue.push(task);
        }
        destructor() {
            const index = $.$mol_after_mock_queue.indexOf(this.task);
            if (index >= 0)
                $.$mol_after_mock_queue.splice(index, 1);
        }
    }
    $.$mol_after_mock_commmon = $mol_after_mock_commmon;
    class $mol_after_mock_timeout extends $mol_after_mock_commmon {
        delay;
        constructor(delay, task) {
            super(task);
            this.delay = delay;
        }
    }
    $.$mol_after_mock_timeout = $mol_after_mock_timeout;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        $.$mol_after_tick = $mol_after_mock_commmon;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Sync execution'() {
            class Sync extends $mol_object2 {
                static calc(a, b) {
                    return a + b;
                }
            }
            __decorate([
                $mol_wire_method
            ], Sync, "calc", null);
            $mol_assert_equal(Sync.calc(1, 2), 3);
        },
        async 'async <=> sync'() {
            class SyncAsync extends $mol_object2 {
                static async val(a) {
                    return a;
                }
                static sum(a, b) {
                    const syn = $mol_wire_sync(this);
                    return syn.val(a) + syn.val(b);
                }
                static async calc(a, b) {
                    return 5 + await $mol_wire_async(this).sum(a, b);
                }
            }
            $mol_assert_equal(await SyncAsync.calc(1, 2), 8);
        },
        async 'Idempotence control'() {
            class Idempotence extends $mol_object2 {
                static logs_idemp = 0;
                static logs_unidemp = 0;
                static log_idemp() {
                    this.logs_idemp += 1;
                }
                static log_unidemp() {
                    this.logs_unidemp += 1;
                }
                static async val(a) {
                    return a;
                }
                static sum(a, b) {
                    this.log_idemp();
                    this.log_unidemp();
                    const syn = $mol_wire_sync(this);
                    return syn.val(a) + syn.val(b);
                }
                static async calc(a, b) {
                    return 5 + await $mol_wire_async(this).sum(a, b);
                }
            }
            __decorate([
                $mol_wire_method
            ], Idempotence, "log_idemp", null);
            $mol_assert_equal(await Idempotence.calc(1, 2), 8);
            $mol_assert_equal(Idempotence.logs_idemp, 1);
            $mol_assert_equal(Idempotence.logs_unidemp, 3);
        },
        async 'Error handling'() {
            class Handle extends $mol_object2 {
                static async sum(a, b) {
                    $mol_fail(new Error('test error ' + (a + b)));
                }
                static check() {
                    try {
                        return $mol_wire_sync(Handle).sum(1, 2);
                    }
                    catch (error) {
                        if ($mol_promise_like(error))
                            $mol_fail_hidden(error);
                        $mol_assert_equal(error.message, 'test error 3');
                    }
                }
            }
            await $mol_wire_async(Handle).check();
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        $.$mol_log3_come = () => { };
        $.$mol_log3_done = () => { };
        $.$mol_log3_fail = () => { };
        $.$mol_log3_warn = () => { };
        $.$mol_log3_rise = () => { };
        $.$mol_log3_area = () => () => { };
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'test types'($) {
            class A {
                static a() {
                    return '';
                }
                static b() {
                    return $mol_wire_async(this).a();
                }
            }
        },
        async 'Latest method calls wins'($) {
            class NameLogger extends $mol_object2 {
                static $ = $;
                static first = [];
                static last = [];
                static send(next) {
                    $mol_wire_sync(this.first).push(next);
                    $$.$mol_wait_timeout(0);
                    this.last.push(next);
                }
            }
            const name = $mol_wire_async(NameLogger).send;
            name('john');
            const promise = name('jin');
            $.$mol_after_mock_warp();
            await promise;
            $mol_assert_equal(NameLogger.first, ['john', 'jin']);
            $mol_assert_equal(NameLogger.last, ['jin']);
        },
        async 'Latest function calls wins'($) {
            const first = [];
            const last = [];
            function send_name(next) {
                $mol_wire_sync(first).push(next);
                $$.$mol_wait_timeout(0);
                last.push(next);
            }
            const name = $mol_wire_async(send_name);
            name('john');
            const promise = name('jin');
            $.$mol_after_mock_warp();
            await promise;
            $mol_assert_equal(first, ['john', 'jin']);
            $mol_assert_equal(last, ['jin']);
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'init with overload'() {
            class X extends $mol_object {
                foo() {
                    return 1;
                }
            }
            var x = X.make({
                foo: () => 2,
            });
            $mol_assert_equal(x.foo(), 2);
        },
        'Context in instance inherits from class'($) {
            const custom = $.$mol_ambient({});
            class X extends $.$mol_object {
                static $ = custom;
            }
            $mol_assert_equal(new X().$, custom);
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        $.$mol_after_timeout = $mol_after_mock_timeout;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'test types'($) {
            class A {
                static a() {
                    return Promise.resolve('');
                }
                static b() {
                    return $mol_wire_sync(this).a();
                }
            }
        },
        async 'test method from host'($) {
            let count = 0;
            class A {
                static a() {
                    return $mol_wire_sync(this).b();
                }
                static b() { return Promise.resolve(++count); }
            }
            $mol_assert_equal(await $mol_wire_async(A).a(), 1, count);
        },
        async 'test function'($) {
            let count = 0;
            class A {
                static a() {
                    return $mol_wire_sync(this.b)();
                }
                static b() { return Promise.resolve(++count); }
            }
            $mol_assert_equal(await $mol_wire_async(A).a(), 1, count);
        },
        async 'test construct itself'($) {
            class A {
                static instances = [];
                static a() {
                    const a = new ($mol_wire_sync(A))();
                    this.instances.push(a);
                    $mol_wire_sync(this).b();
                }
                static b() { return Promise.resolve(); }
            }
            await $mol_wire_async(A).a();
            $mol_assert_equal(A.instances.length, 2);
            $mol_assert_equal(A.instances[0] instanceof A, true);
            $mol_assert_equal(A.instances[0], A.instances[1]);
        }
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        $.$mol_after_work = $mol_after_mock_timeout;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test_mocks.push($ => {
            $.$mol_wait_timeout = function $mol_wait_timeout_mock(timeout) { };
            $.$mol_wait_timeout_async = async function $mol_wait_timeout_async_mock(timeout) { };
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test_mocks.push($ => {
            $.$mol_wait_rest = function $mol_wait_rest_mock() { };
            $.$mol_wait_rest_async = async function $mol_wait_rest_async_mock() { };
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        // https://github.com/nin-jin/slides/tree/master/reactivity#component-states
        'Cached channel'($) {
            class App extends $mol_object2 {
                static $ = $;
                static value(next = 1) {
                    return next + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "value", null);
            $mol_assert_equal(App.value(), 2);
            App.value(2);
            $mol_assert_equal(App.value(), 3);
        },
        'Read Pushed'($) {
            class App extends $mol_object2 {
                static $ = $;
                static value(next = 0) {
                    return next;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "value", null);
            $mol_assert_equal(App.value(1), 1);
            $mol_assert_equal(App.value(), 1);
        },
        'Mem overrides mem'($) {
            class Base extends $mol_object2 {
                static $ = $;
                static value(next = 1) {
                    return next + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], Base, "value", null);
            class Middle extends Base {
                static value(next) {
                    return super.value(next) + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], Middle, "value", null);
            class App extends Middle {
                static value(next) {
                    return super.value(next) * 3;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "value", null);
            $mol_assert_equal(App.value(), 9);
            $mol_assert_equal(App.value(5), 21);
            $mol_assert_equal(App.value(), 21);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-consistency
        'Auto recalculation of cached values'($) {
            class App extends $mol_object2 {
                static $ = $;
                static xxx(next) {
                    return next || 1;
                }
                static yyy() {
                    return this.xxx() + 1;
                }
                static zzz() {
                    return this.yyy() + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "xxx", null);
            __decorate([
                $mol_wire_solo
            ], App, "yyy", null);
            __decorate([
                $mol_wire_solo
            ], App, "zzz", null);
            $mol_assert_equal(App.yyy(), 2);
            $mol_assert_equal(App.zzz(), 3);
            App.xxx(5);
            $mol_assert_equal(App.zzz(), 7);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-reasonability
        'Skip recalculation when actually no dependency changes'($) {
            const log = [];
            class App extends $mol_object2 {
                static $ = $;
                static xxx(next) {
                    log.push('xxx');
                    return next || 1;
                }
                static yyy() {
                    log.push('yyy');
                    return [Math.sign(this.xxx())];
                }
                static zzz() {
                    log.push('zzz');
                    return this.yyy()[0] + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "xxx", null);
            __decorate([
                $mol_wire_solo
            ], App, "yyy", null);
            __decorate([
                $mol_wire_solo
            ], App, "zzz", null);
            App.zzz();
            $mol_assert_like(log, ['zzz', 'yyy', 'xxx']);
            App.xxx(5);
            $mol_assert_like(log, ['zzz', 'yyy', 'xxx', 'xxx']);
            App.zzz();
            $mol_assert_like(log, ['zzz', 'yyy', 'xxx', 'xxx', 'yyy']);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#flow-auto
        'Flow: Auto'($) {
            class App extends $mol_object2 {
                static get $() { return $; }
                static source(next = 1) { return next; }
                static condition(next = true) { return next; }
                static counter = 0;
                static result() {
                    const res = this.condition() ? this.source() : 0;
                    return res + this.counter++;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "source", null);
            __decorate([
                $mol_wire_solo
            ], App, "condition", null);
            __decorate([
                $mol_wire_solo
            ], App, "result", null);
            $mol_assert_equal(App.result(), 1);
            $mol_assert_equal(App.counter, 1);
            App.source(10);
            $mol_assert_equal(App.result(), 11);
            $mol_assert_equal(App.counter, 2);
            App.condition(false);
            $mol_assert_equal(App.result(), 2);
            $mol_assert_equal(App.counter, 3);
            $mol_wire_fiber.sync();
            $mol_assert_equal(App.source(), 1);
            App.source(20);
            $mol_assert_equal(App.result(), 2);
            $mol_assert_equal(App.counter, 3);
            App.condition(true);
            $mol_assert_equal(App.result(), 23);
            $mol_assert_equal(App.counter, 4);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#dupes-equality
        'Dupes: Equality'($) {
            let counter = 0;
            class App extends $mol_object2 {
                static $ = $;
                static foo(next) {
                    return next ?? { numbs: [1] };
                }
                static bar() {
                    return { ...this.foo(), count: ++counter };
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "foo", null);
            __decorate([
                $mol_wire_solo
            ], App, "bar", null);
            $mol_assert_like(App.bar(), { numbs: [1], count: 1 });
            App.foo({ numbs: [1] });
            $mol_assert_like(App.bar(), { numbs: [1], count: 1 });
            App.foo({ numbs: [2] });
            $mol_assert_like(App.bar(), { numbs: [2], count: 2 });
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#cycle-fail
        'Cycle: Fail'($) {
            class App extends $mol_object2 {
                static $ = $;
                static foo() {
                    return this.bar() + 1;
                }
                static bar() {
                    return this.foo() + 1;
                }
                static test() {
                    $mol_assert_fail(() => App.foo(), 'Circular subscription');
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "foo", null);
            __decorate([
                $mol_wire_solo
            ], App, "bar", null);
            __decorate([
                $mol_wire_method
            ], App, "test", null);
            App.test();
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-stability
        // 'Update deps on push'( $ ) {
        // 	class App extends $mol_object2 {
        // 		static $ = $
        // 		@ $mol_wire_solo
        // 		static left( next = false ) {
        // 			return next
        // 		}
        // 		@ $mol_wire_solo
        // 		static right( next = false ) {
        // 			return next
        // 		}
        // 		@ $mol_wire_solo
        // 		static res( next?: boolean ) {
        // 			return this.left( next ) && this.right()
        // 		}
        // 	}
        // 	$mol_assert_equal( App.res(), false )
        // 	$mol_assert_equal( App.res( true ), false )
        // 	$mol_assert_equal( App.right( true ), true )
        // 	$mol_assert_equal( App.res(), true )
        // } ,
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-stability
        'Different order of pull and push'($) {
            class App extends $mol_object2 {
                static $ = $;
                static store(next = 0) {
                    return next;
                }
                static fast(next) {
                    return this.store(next);
                }
                static slow(next) {
                    if (next !== undefined)
                        this.slow(); // enforce pull before push
                    return this.store(next);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "store", null);
            __decorate([
                $mol_wire_solo
            ], App, "fast", null);
            __decorate([
                $mol_wire_solo
            ], App, "slow", null);
            App.fast();
            $mol_assert_equal(App.slow(666), 666);
            $mol_assert_equal(App.fast(), App.slow(), 666);
            App.store(777);
            $mol_assert_equal(App.fast(), App.slow(), 777);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-stability
        'Actions inside invariant'($) {
            class App extends $mol_object2 {
                static $ = $;
                static count(next = 0) {
                    return next;
                }
                static count2() {
                    return this.count();
                }
                static res() {
                    const count = this.count2();
                    if (!count)
                        this.count(count + 1);
                    return count + 1;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "count", null);
            __decorate([
                $mol_wire_solo
            ], App, "count2", null);
            __decorate([
                $mol_wire_solo
            ], App, "res", null);
            $mol_assert_like(App.res(), 1);
            App.count(5);
            $mol_assert_like(App.res(), 6);
        },
        async 'Toggle with async'($) {
            class App extends $mol_object2 {
                static $ = $;
                static checked(next = false) {
                    $$.$mol_wait_timeout(0);
                    return next;
                }
                static toggle() {
                    const prev = this.checked();
                    $mol_assert_unique(this.checked(!prev), prev);
                    // $mol_assert_equal( this.checked() , prev )
                }
                static res() {
                    return this.checked();
                }
                static test() {
                    $mol_assert_equal(App.res(), false);
                    App.toggle();
                    $mol_assert_equal(App.res(), true);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "checked", null);
            __decorate([
                $mol_wire_method
            ], App, "toggle", null);
            __decorate([
                $mol_wire_solo
            ], App, "res", null);
            __decorate([
                $mol_wire_method
            ], App, "test", null);
            await $mol_wire_async(App).test();
        },
        // // https://github.com/nin-jin/slides/tree/master/reactivity#wish-stability
        // 'Stable order of multiple root'( $ ) {
        // 	class App extends $mol_object2 {
        // 		static $ = $
        // 		static counter = 0
        // 		@ $mol_wire_solo
        // 		static left_trigger( next = 0 ) {
        // 			return next
        // 		}
        // 		@ $mol_wire_solo
        // 		static left_root() {
        // 			this.left_trigger()
        // 			return ++ this.counter
        // 		}
        // 		@ $mol_wire_solo
        // 		static right_trigger( next = 0 ) {
        // 			return next
        // 		}
        // 		@ $mol_wire_solo
        // 		static right_root() {
        // 			this.right_trigger()
        // 			return ++ this.counter
        // 		}
        // 	}
        // 	$mol_assert_equal( App.left_root(), 1 )
        // 	$mol_assert_equal( App.right_root(), 2 )
        // 	App.right_trigger( 1 )
        // 	App.left_trigger( 1 )
        // 	$mol_wire_fiber.sync()
        // 	$mol_assert_equal( App.right_root(), 4 )
        // 	$mol_assert_equal( App.left_root(), 3 )
        // } ,
        // https://github.com/nin-jin/slides/tree/master/reactivity#error-store
        'Restore after error'($) {
            class App extends $mol_object2 {
                static get $() { return $; }
                static condition(next = false) { return next; }
                static broken() {
                    if (this.condition()) {
                        $mol_fail(new Error('test error'));
                    }
                    return 1;
                }
                static result() {
                    return this.broken();
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "condition", null);
            __decorate([
                $mol_wire_solo
            ], App, "broken", null);
            __decorate([
                $mol_wire_solo
            ], App, "result", null);
            $mol_assert_equal(App.result(), 1);
            App.condition(true);
            $mol_assert_fail(() => App.result(), 'test error');
            App.condition(false);
            $mol_assert_equal(App.result(), 1);
        },
        async 'Wait for data'($) {
            class App extends $mol_object2 {
                static $ = $;
                static async source() {
                    return 'Jin';
                }
                static middle() {
                    return $mol_wire_sync(this).source();
                }
                static target() {
                    return this.middle();
                }
                static test() {
                    $mol_assert_equal(App.target(), 'Jin');
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "middle", null);
            __decorate([
                $mol_wire_solo
            ], App, "target", null);
            __decorate([
                $mol_wire_method
            ], App, "test", null);
            await $mol_wire_async(App).test();
        },
        'Auto destroy on long alone'($) {
            let destroyed = false;
            class App extends $mol_object2 {
                static $ = $;
                static showing(next = true) {
                    return next;
                }
                static details() {
                    return {
                        destructor() {
                            destroyed = true;
                        }
                    };
                }
                static render() {
                    return this.showing() ? this.details() : null;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "showing", null);
            __decorate([
                $mol_wire_solo
            ], App, "details", null);
            __decorate([
                $mol_wire_solo
            ], App, "render", null);
            const details = App.render();
            $mol_assert_ok(details);
            App.showing(false);
            $mol_assert_not(App.render());
            App.showing(true);
            $mol_assert_equal(App.render(), details);
            $mol_wire_fiber.sync();
            $mol_assert_not(destroyed);
            App.showing(false);
            $mol_wire_fiber.sync();
            $mol_assert_ok(destroyed);
            App.showing(true);
            $mol_assert_unique(App.render(), details);
        },
        // https://github.com/nin-jin/slides/tree/master/reactivity#wish-stability
        async 'Hold pubs while wait async task'($) {
            class App extends $mol_object2 {
                static $ = $;
                static counter = 0;
                static resets(next) {
                    return ($mol_wire_probe(() => this.resets()) ?? -1) + 1;
                }
                static async wait() { }
                static value() {
                    return ++this.counter;
                }
                static result() {
                    if (this.resets())
                        $mol_wire_sync(this).wait();
                    return this.value();
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "resets", null);
            __decorate([
                $mol_wire_solo
            ], App, "value", null);
            __decorate([
                $mol_wire_solo
            ], App, "result", null);
            $mol_assert_equal(App.result(), 1);
            App.resets(null);
            $mol_wire_fiber.sync();
            $mol_assert_equal(await $mol_wire_async(App).result(), 1);
        },
        'Owned value has js-path name'() {
            class App extends $mol_object2 {
                static title() {
                    return new $mol_object2;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "title", null);
            $mol_assert_equal(`${App.title()}`, 'App.title<>');
        },
        'Unsubscribe from temp pubs on complete'($) {
            class Random extends $mol_object2 {
                static $ = $;
                static seed() {
                    return Math.random();
                }
                static resets(next) {
                    return Math.random();
                }
                static value() {
                    this.resets();
                    return this.seed();
                }
            }
            __decorate([
                $mol_wire_method
            ], Random, "seed", null);
            __decorate([
                $mol_wire_solo
            ], Random, "resets", null);
            __decorate([
                $mol_wire_solo
            ], Random, "value", null);
            const first = Random.value();
            Random.resets(null);
            $mol_assert_unique(Random.value(), first);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Error caching'($) {
            const next_cached = 123;
            class Some extends $mol_object2 {
                static $ = $;
                static data(id, next) {
                    if (next)
                        return next;
                    setTimeout(() => {
                        $mol_wire_async(this).data(id, next_cached);
                    }, 10);
                    $mol_fail_hidden(new Promise(() => { }));
                }
                static run() {
                    return this.data('1');
                }
            }
            __decorate([
                $mol_wire_plex
            ], Some, "data", null);
            __decorate([
                $mol_wire_method
            ], Some, "run", null);
            const val = await $mol_wire_async(Some).run();
            $mol_assert_equal(val, next_cached);
        },
        'Memoize by single simple key'($) {
            class Team extends $mol_object2 {
                static $ = $;
                static user_name(user, next) {
                    return next ?? user;
                }
                static user_names() {
                    return [
                        this.user_name('jin'),
                        this.user_name('john'),
                    ];
                }
            }
            __decorate([
                $mol_wire_plex
            ], Team, "user_name", null);
            __decorate([
                $mol_wire_solo
            ], Team, "user_names", null);
            $mol_assert_like(Team.user_names(), ['jin', 'john']);
            Team.user_name('jin', 'JIN');
            $mol_assert_like(Team.user_names(), ['JIN', 'john']);
        },
        'Memoize by single complex key'($) {
            class Map extends $mol_object2 {
                static $ = $;
                static tile(pos) {
                    return new String(`/tile=${pos}`);
                }
                static test() {
                    $mol_assert_like(this.tile([0, 1]), new String('/tile=0,1'));
                    $mol_assert_equal(this.tile([0, 1]), this.tile([0, 1]));
                }
            }
            __decorate([
                $mol_wire_plex
            ], Map, "tile", null);
            __decorate([
                $mol_wire_method
            ], Map, "test", null);
            Map.test();
        },
        'Owned value has js-path name'() {
            class App extends $mol_object2 {
                static like(friend) {
                    return new $mol_object2;
                }
                static relation([friend, props]) {
                    return new $mol_object2;
                }
            }
            __decorate([
                $mol_wire_plex
            ], App, "like", null);
            __decorate([
                $mol_wire_plex
            ], App, "relation", null);
            $mol_assert_equal(`${App.like(123)}`, 'App.like<123>');
            $mol_assert_equal(`${App.relation([123, [456]])}`, 'App.relation<[123,[456]]>');
        },
        'Deep deps'($) {
            class Fib extends $mol_object2 {
                static $ = $;
                static sums = 0;
                static value(index, next) {
                    if (next)
                        return next;
                    if (index < 2)
                        return 1;
                    ++this.sums;
                    return this.value(index - 1) + this.value(index - 2);
                }
            }
            __decorate([
                $mol_wire_plex
            ], Fib, "value", null);
            $mol_assert_equal(Fib.value(4), 5);
            $mol_assert_equal(Fib.sums, 3);
            Fib.value(1, 2);
            $mol_assert_equal(Fib.value(4), 8);
            $mol_assert_equal(Fib.sums, 6);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Previous value'() {
            class Cache extends $mol_object2 {
                static store(next) {
                    if (!next)
                        return {};
                    return {
                        ...$mol_wire_probe(() => this.store()) ?? {},
                        ...next,
                    };
                }
            }
            __decorate([
                $mol_wire_solo
            ], Cache, "store", null);
            $mol_assert_like(Cache.store(), {});
            $mol_assert_like(Cache.store({ foo: 666 }), { foo: 666 });
            $mol_assert_like(Cache.store({ bar: 777 }), { foo: 666, bar: 777 });
        },
    });
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($) {
    $mol_test({
        'Primitives'() {
            $mol_assert_equal($mol_key(null), 'null');
            $mol_assert_equal($mol_key(false), 'false');
            $mol_assert_equal($mol_key(true), 'true');
            $mol_assert_equal($mol_key(0), '0');
            $mol_assert_equal($mol_key(1n << 64n), '18446744073709551616n');
            $mol_assert_equal($mol_key(''), '""');
        },
        'Array & POJO'() {
            $mol_assert_equal($mol_key([null]), '[null]');
            $mol_assert_equal($mol_key({ foo: 0 }), '{"foo":0}');
            $mol_assert_equal($mol_key({ foo: [false] }), '{"foo":[false]}');
        },
        'Uint8Array'() {
            $mol_assert_equal($mol_key(new Uint8Array([1, 2])), 'Uint8Array([1,2])');
            $mol_assert_equal($mol_key([new Uint8Array([1, 2])]), '[Uint8Array([1,2])]');
            $mol_assert_equal($mol_key({ foo: new Uint8Array([1, 2]) }), '{"foo":Uint8Array([1,2])}');
        },
        'Function'() {
            const func = () => { };
            $mol_assert_equal($mol_key(func), $mol_key(func));
            $mol_assert_unique($mol_key(func), $mol_key(() => { }));
        },
        'Objects'() {
            class User {
            }
            const jin = new User();
            $mol_assert_equal($mol_key(jin), $mol_key(jin));
            $mol_assert_unique($mol_key(jin), $mol_key(new User()));
        },
        'Elements'() {
            const foo = $mol_jsx("div", null, "bar");
            $mol_assert_equal($mol_key(foo), $mol_key(foo));
            $mol_assert_unique($mol_key(foo), $mol_key($mol_jsx("div", null, "bar")));
        },
        'Custom JSON representation'() {
            class User {
                toJSON() { return 'jin'; }
            }
            $mol_assert_unique([$mol_key(new User)], [$mol_key(new User)]);
        },
        'Custom key handler'() {
            class User {
                name;
                age;
                constructor(name, age) {
                    this.name = name;
                    this.age = age;
                }
                [$mol_key_handle]() { return `User(${JSON.stringify(this.name)})`; }
            }
            $mol_assert_equal($mol_key([new User('jin', 16)]), $mol_key([new User('jin', 18)]), '[User("jin")]');
        },
        'Special native classes'() {
            $mol_assert_equal($mol_key(new Date('xyz')), 'Date(NaN)');
            $mol_assert_equal($mol_key(new Date(12345)), 'Date(12345)');
            $mol_assert_equal($mol_key(/./), '/./');
            $mol_assert_equal($mol_key(/\./gimsu), '/\\./gimsu');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        $.$mol_after_frame = $mol_after_mock_commmon;
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'return result without errors'() {
            $mol_assert_equal($mol_try(() => false), false);
        },
        //'return error if thrown'() {
        //	
        //	const error = new Error( '$mol_try test error' )
        //	$mol_assert_equal( $mol_try( ()=> { throw error } ) , error )
        //	
        //} ,
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => $.$mol_fail_log = () => false);
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /** Watch and logs reactive states. Logger automatically added to test bundle which is adding to `test.html`. */
    class $mol_wire_log extends $mol_object2 {
        static watch(task) {
            return task;
        }
        static track(fiber) {
            const prev = $mol_wire_probe(() => this.track(fiber));
            let next;
            try {
                next = fiber.sync();
            }
            finally {
                for (const pub of fiber.pub_list) {
                    if (pub instanceof $mol_wire_fiber) {
                        this.track(pub);
                    }
                }
            }
            if (fiber.host === this)
                return next;
            if ($mol_compare_deep(prev, next)) {
                this.$.$mol_log3_rise({
                    message: '💧 Same',
                    place: fiber,
                });
            }
            else if (prev !== undefined) {
                this.$.$mol_log3_rise({
                    message: '🔥 Next',
                    place: fiber,
                    prev,
                });
            }
            return next;
        }
        static active() {
            try {
                this.watch()?.();
            }
            catch (error) {
                $mol_fail_log(error);
            }
            finally {
                for (const pub of $mol_wire_auto().pub_list) {
                    if (pub instanceof $mol_wire_fiber) {
                        this.track(pub);
                    }
                }
            }
        }
    }
    __decorate([
        $mol_mem
    ], $mol_wire_log, "watch", null);
    __decorate([
        $mol_mem_key
    ], $mol_wire_log, "track", null);
    __decorate([
        $mol_mem
    ], $mol_wire_log, "active", null);
    $.$mol_wire_log = $mol_wire_log;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_wire_log.active();
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'all cases of using maybe'() {
            $mol_assert_equal($mol_maybe(0)[0], 0);
            $mol_assert_equal($mol_maybe(false)[0], false);
            $mol_assert_equal($mol_maybe(null)[0], void 0);
            $mol_assert_equal($mol_maybe(void 0)[0], void 0);
            $mol_assert_equal($mol_maybe(void 0).map(v => v.toString())[0], void 0);
            $mol_assert_equal($mol_maybe(0).map(v => v.toString())[0], '0');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'run callback'() {
            class Plus1 extends $mol_wrapper {
                static wrap(task) {
                    return function (...args) {
                        return task.call(this, ...args) + 1;
                    };
                }
            }
            $mol_assert_equal(Plus1.run(() => 2), 3);
        },
        'wrap function'() {
            class Plus1 extends $mol_wrapper {
                static wrap(task) {
                    return function (...args) {
                        return task.call(this, ...args) + 1;
                    };
                }
            }
            const obj = {
                level: 2,
                pow: Plus1.func(function (a) {
                    return a ** this.level;
                })
            };
            $mol_assert_equal(obj.pow(2), 5);
        },
        'decorate field getter'() {
            class Plus1 extends $mol_wrapper {
                static last = 0;
                static wrap(task) {
                    return function (...args) {
                        return Plus1.last = (task.call(this, ...args) || 0) + 1;
                    };
                }
            }
            class Foo {
                static get two() {
                    return 1;
                }
                static set two(next) { }
            }
            __decorate([
                Plus1.field
            ], Foo, "two", null);
            $mol_assert_equal(Foo.two, 2);
            Foo.two = 3;
            $mol_assert_equal(Plus1.last, 2);
            $mol_assert_equal(Foo.two, 2);
        },
        'decorate instance method'() {
            class Plus1 extends $mol_wrapper {
                static wrap(task) {
                    return function (...args) {
                        return task.call(this, ...args) + 1;
                    };
                }
            }
            class Foo1 {
                level = 2;
                pow(a) {
                    return a ** this.level;
                }
            }
            __decorate([
                Plus1.method
            ], Foo1.prototype, "pow", null);
            const Foo2 = Foo1;
            const foo = new Foo2;
            $mol_assert_equal(foo.pow(2), 5);
        },
        'decorate static method'() {
            class Plus1 extends $mol_wrapper {
                static wrap(task) {
                    return function (...args) {
                        return task.call(this, ...args) + 1;
                    };
                }
            }
            class Foo {
                static level = 2;
                static pow(a) {
                    return a ** this.level;
                }
            }
            __decorate([
                Plus1.method
            ], Foo, "pow", null);
            $mol_assert_equal(Foo.pow(2), 5);
        },
        'decorate class'() {
            class BarInc extends $mol_wrapper {
                static wrap(task) {
                    return function (...args) {
                        const foo = task.call(this, ...args);
                        foo.bar++;
                        return foo;
                    };
                }
            }
            let Foo = class Foo {
                bar;
                constructor(bar) {
                    this.bar = bar;
                }
            };
            Foo = __decorate([
                BarInc.class
            ], Foo);
            $mol_assert_equal(new Foo(2).bar, 3);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'memoize field'() {
            class Foo {
                static one = 1;
                static get two() {
                    return ++this.one;
                }
                static set two(next) { }
            }
            __decorate([
                $mol_memo.field
            ], Foo, "two", null);
            $mol_assert_equal(Foo.two, 2);
            $mol_assert_equal(Foo.two, 2);
            Foo.two = 3;
            $mol_assert_equal(Foo.two, 3);
            $mol_assert_equal(Foo.two, 3);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'const returns stored value'() {
            const foo = { bar: $mol_const(Math.random()) };
            $mol_assert_equal(foo.bar(), foo.bar());
            $mol_assert_equal(foo.bar(), foo.bar['()']);
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'id auto generation'($) {
            class $mol_view_test_item extends $mol_view {
            }
            class $mol_view_test_block extends $mol_view {
                static $ = $;
                element(id) {
                    return new $mol_view_test_item();
                }
            }
            __decorate([
                $mol_mem_key
            ], $mol_view_test_block.prototype, "element", null);
            var x = $mol_view_test_block.Root(0);
            $mol_assert_equal(x.dom_node().id, '$mol_view_test_block.Root(0)');
            $mol_assert_equal(x.element(0).dom_node().id, '$mol_view_test_block.Root(0).element(0)');
        },
        'caching ref to dom node'($) {
            var x = new class extends $mol_view {
            };
            x.$ = $;
            $mol_assert_equal(x.dom_node(), x.dom_node());
        },
        'content render'($) {
            class $mol_view_test extends $mol_view {
                sub() {
                    return ['lol', 5];
                }
            }
            var x = new $mol_view_test();
            x.$ = $;
            var node = x.dom_tree();
            $mol_assert_equal(node.innerHTML, 'lol5');
        },
        'bem attributes generation'($) {
            class $mol_view_test_item extends $mol_view {
            }
            class $mol_view_test_block extends $mol_view {
                Element(id) {
                    return new $mol_view_test_item();
                }
            }
            __decorate([
                $mol_mem_key
            ], $mol_view_test_block.prototype, "Element", null);
            var x = new $mol_view_test_block();
            x.$ = $;
            $mol_assert_equal(x.dom_node().getAttribute('mol_view_test_block'), '');
            $mol_assert_equal(x.dom_node().getAttribute('mol_view'), '');
            $mol_assert_equal(x.Element(0).dom_node().getAttribute('mol_view_test_block_element'), '');
            $mol_assert_equal(x.Element(0).dom_node().getAttribute('mol_view_test_item'), '');
            $mol_assert_equal(x.Element(0).dom_node().getAttribute('mol_view'), '');
        },
        'render custom attributes'($) {
            class $mol_view_test extends $mol_view {
                attr() {
                    return {
                        'href': '#haha',
                        'required': true,
                        'hidden': false,
                    };
                }
            }
            var x = new $mol_view_test();
            x.$ = $;
            var node = x.dom_tree();
            $mol_assert_equal(node.getAttribute('href'), '#haha');
            $mol_assert_equal(node.getAttribute('required'), 'true');
            $mol_assert_equal(node.getAttribute('hidden'), null);
        },
        'render custom fields'($) {
            class $mol_view_test extends $mol_view {
                field() {
                    return {
                        'hidden': true
                    };
                }
            }
            var x = new $mol_view_test();
            x.$ = $;
            var node = x.dom_tree();
            $mol_assert_equal(node.hidden, true);
        },
        'attach event handlers'($) {
            var clicked = false;
            class $mol_view_test extends $mol_view {
                event() {
                    return {
                        'click': (next) => this.event_click(next)
                    };
                }
                event_click(next) {
                    clicked = true;
                }
            }
            var x = new $mol_view_test();
            x.$ = $;
            var node = x.dom_node();
            node.click();
            $mol_assert_ok(clicked);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class $mol_style_sheet_test1 extends $mol_view {
        Item() { return new $mol_view; }
    }
    $.$mol_style_sheet_test1 = $mol_style_sheet_test1;
    class $mol_style_sheet_test2 extends $mol_view {
        List() { return new $mol_style_sheet_test1; }
    }
    $.$mol_style_sheet_test2 = $mol_style_sheet_test2;
    $mol_test({
        'component block styles'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                display: 'block',
                zIndex: 1,
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tdisplay: block;\n\tz-index: 1;\n}\n');
        },
        'various units'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                width: '50%',
                height: '50px',
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\twidth: 50%;\n\theight: 50px;\n}\n');
        },
        'various functions'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const { calc } = $mol_style_func;
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                width: calc(`100% - 1px`),
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\twidth: calc(100% - 1px);\n}\n');
        },
        'property groups'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                flex: {
                    grow: 5,
                    shrink: 10,
                }
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tflex-grow: 5;\n\tflex-shrink: 10;\n}\n');
        },
        'custom properties'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                '--isVariable': 'yes',
                '--is_variable': 'no',
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\t--is-variable: yes;\n\t--is_variable: no;\n}\n');
        },
        'custom property groups'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                '--variable': {
                    test1: '5px',
                    test2: '10px',
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\t--variable-test1: 5px;\n\t--variable-test2: 10px;\n}\n');
        },
        'property shorthand'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                padding: ['5px', 'auto'],
                margin: ['10px', 'auto'],
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tpadding: 5px auto;\n\tmargin: 10px auto;\n}\n');
        },
        'sequenced values'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const { url } = $mol_style_func;
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                background: {
                    image: [[url('foo')], [url('bar')]],
                    size: [['cover'], ['contain']],
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tbackground-image: url("foo"),url("bar");\n\tbackground-size: cover,contain;\n}\n');
        },
        'sequenced structs'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                box: {
                    shadow: [
                        {
                            inset: true,
                            x: 0,
                            y: 0,
                            blur: '0.5rem',
                            spread: 0,
                            color: 'red',
                        },
                        {
                            inset: false,
                            x: 0,
                            y: 0,
                            blur: '0.5rem',
                            spread: 0,
                            color: 'blue',
                        },
                    ],
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tbox-shadow: inset 0 0 0.5rem 0 red,0 0 0.5rem 0 blue;\n}\n');
        },
        'component block styles with pseudo class'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                ':focus': {
                    display: 'block',
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n[mol_style_sheet_test]:focus {\n\tdisplay: block;\n}\n');
        },
        'component block styles with pseudo element'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                '::first-line': {
                    display: 'block',
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n[mol_style_sheet_test]::first-line {\n\tdisplay: block;\n}\n');
        },
        'component block styles with media query'() {
            class $mol_style_sheet_test extends $mol_view {
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                '@media': {
                    'print': {
                        display: 'block',
                    },
                    '(max-width: 640px)': {
                        display: 'inline',
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n@media print {\n[mol_style_sheet_test] {\n\tdisplay: block;\n}\n}\n@media (max-width: 640px) {\n[mol_style_sheet_test] {\n\tdisplay: inline;\n}\n}\n');
        },
        'component block styles with attribute value'() {
            class $mol_style_sheet_test extends $mol_view {
                attr() {
                    return {
                        mol_theme: '$mol_theme_dark'
                    };
                }
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                '@': {
                    mol_theme: {
                        '$mol_theme_dark': {
                            display: 'block',
                        },
                    },
                    disabled: {
                        'true': {
                            width: '100%',
                        },
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n[mol_style_sheet_test]:where([mol_theme="$mol_theme_dark"]) {\n\tdisplay: block;\n}\n[mol_style_sheet_test]:where([disabled="true"]) {\n\twidth: 100%;\n}\n');
        },
        'component block styles with attribute value (short syntax)'() {
            class $mol_style_sheet_test extends $mol_view {
                attr() {
                    return {
                        mol_theme: '$mol_theme_dark'
                    };
                }
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                '[mol_theme]': {
                    '$mol_theme_dark': {
                        display: 'block',
                    },
                },
                '[disabled]': {
                    'true': {
                        width: '100%',
                    },
                    'false': {
                        width: '50%',
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n[mol_style_sheet_test]:where([mol_theme="$mol_theme_dark"]) {\n\tdisplay: block;\n}\n[mol_style_sheet_test]:where([disabled="true"]) {\n\twidth: 100%;\n}\n[mol_style_sheet_test]:where([disabled="false"]) {\n\twidth: 50%;\n}\n');
        },
        'component element styles'() {
            class $mol_style_sheet_test extends $mol_view {
                Item() { return new $mol_view; }
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                color: 'red',
                Item: {
                    display: 'block',
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test] {\n\tcolor: red;\n}\n[mol_style_sheet_test_item] {\n\tdisplay: block;\n}\n');
        },
        'component element of element styles'() {
            const sheet = $mol_style_sheet($mol_style_sheet_test2, {
                width: '100%',
                List: {
                    color: 'red',
                    Item: {
                        display: 'block',
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test2] {\n\twidth: 100%;\n}\n[mol_style_sheet_test2_list] {\n\tcolor: red;\n}\n[mol_style_sheet_test2_list_item] {\n\tdisplay: block;\n}\n');
        },
        'component element styles with block attribute value'() {
            class $mol_style_sheet_test extends $mol_view {
                Item() { return new $mol_view; }
                attr() {
                    return {
                        mol_theme: '$mol_theme_dark',
                        disabled: true,
                    };
                }
            }
            const sheet = $mol_style_sheet($mol_style_sheet_test, {
                '@': {
                    mol_theme: {
                        '$mol_theme_dark': {
                            Item: {
                                color: 'red',
                            },
                        },
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test]:where([mol_theme="$mol_theme_dark"]) :where([mol_style_sheet_test_item]) {\n\tcolor: red;\n}\n');
        },
        'inner component styles by class'() {
            const sheet = $mol_style_sheet($mol_style_sheet_test2, {
                color: 'red',
                $mol_style_sheet_test1: {
                    display: 'block',
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test2] {\n\tcolor: red;\n}\n[mol_style_sheet_test2] :where([mol_style_sheet_test1]) {\n\tdisplay: block;\n}\n');
        },
        'child component styles by class'() {
            const sheet = $mol_style_sheet($mol_style_sheet_test2, {
                color: 'red',
                '>': {
                    $mol_style_sheet_test1: {
                        display: 'block',
                    },
                    $mol_style_sheet_test2: {
                        display: 'inline',
                    },
                },
            });
            $mol_assert_equal(sheet, '[mol_style_sheet_test2] {\n\tcolor: red;\n}\n[mol_style_sheet_test2] > :where([mol_style_sheet_test1]) {\n\tdisplay: block;\n}\n[mol_style_sheet_test2] > :where([mol_style_sheet_test2]) {\n\tdisplay: inline;\n}\n');
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Vector limiting'() {
            let point = new $mol_vector_3d(7, 10, 13);
            const res = point.limited([[1, 5], [15, 20], [5, 10]]);
            $mol_assert_equal(res.x, 5);
            $mol_assert_equal(res.y, 15);
            $mol_assert_equal(res.z, 10);
        },
        'Vector adding scalar'() {
            let point = new $mol_vector_3d(1, 2, 3);
            let res = point.added0(5);
            $mol_assert_equal(res.x, 6);
            $mol_assert_equal(res.y, 7);
            $mol_assert_equal(res.z, 8);
        },
        'Vector adding vector'() {
            let point = new $mol_vector_3d(1, 2, 3);
            let res = point.added1([5, 10, 15]);
            $mol_assert_equal(res.x, 6);
            $mol_assert_equal(res.y, 12);
            $mol_assert_equal(res.z, 18);
        },
        'Vector multiplying scalar'() {
            let point = new $mol_vector_3d(2, 3, 4);
            let res = point.multed0(-1);
            $mol_assert_equal(res.x, -2);
            $mol_assert_equal(res.y, -3);
            $mol_assert_equal(res.z, -4);
        },
        'Vector multiplying vector'() {
            let point = new $mol_vector_3d(2, 3, 4);
            let res = point.multed1([5, 2, -2]);
            $mol_assert_equal(res.x, 10);
            $mol_assert_equal(res.y, 6);
            $mol_assert_equal(res.z, -8);
        },
        'Matrix adding matrix'() {
            let matrix = new $mol_vector_matrix(...[[1, 2], [3, 4], [5, 6]]);
            let res = matrix.added2([[10, 20], [30, 40], [50, 60]]);
            $mol_assert_equal(res[0][0], 11);
            $mol_assert_equal(res[0][1], 22);
            $mol_assert_equal(res[1][0], 33);
            $mol_assert_equal(res[1][1], 44);
            $mol_assert_equal(res[2][0], 55);
            $mol_assert_equal(res[2][1], 66);
        },
        'Matrix multiplying matrix'() {
            let matrix = new $mol_vector_matrix(...[[2, 3], [4, 5], [6, 7]]);
            let res = matrix.multed2([[2, 3], [4, 5], [6, 7]]);
            $mol_assert_equal(res[0][0], 4);
            $mol_assert_equal(res[0][1], 9);
            $mol_assert_equal(res[1][0], 16);
            $mol_assert_equal(res[1][1], 25);
            $mol_assert_equal(res[2][0], 36);
            $mol_assert_equal(res[2][1], 49);
        },
        'Range expanding'() {
            let range = $mol_vector_range_full.inversed;
            const expanded = range.expanded0(10).expanded0(5);
            $mol_assert_like([...expanded], [5, 10]);
        },
        'Vector of range expanding by vector'() {
            let dimensions = new $mol_vector_2d($mol_vector_range_full.inversed, $mol_vector_range_full.inversed);
            const expanded = dimensions.expanded1([1, 7]).expanded1([3, 5]);
            $mol_assert_like([...expanded.x], [1, 3]);
            $mol_assert_like([...expanded.y], [5, 7]);
        },
        'Vector of range expanding by vector of range'() {
            let dimensions = new $mol_vector_2d($mol_vector_range_full.inversed, $mol_vector_range_full.inversed);
            const expanded = dimensions
                .expanded2([[1, 3], [7, 9]])
                .expanded2([[2, 4], [6, 8]]);
            $mol_assert_like([...expanded.x], [1, 4]);
            $mol_assert_like([...expanded.y], [6, 9]);
        },
        'Vector of infinity range expanding by vector of range'() {
            let dimensions = new $mol_vector_2d($mol_vector_range_full.inversed, $mol_vector_range_full.inversed);
            const next = new $mol_vector_2d($mol_vector_range_full.inversed, $mol_vector_range_full.inversed);
            const expanded = next
                .expanded2(dimensions);
            $mol_assert_like([...expanded.x], [Infinity, -Infinity]);
            $mol_assert_like([...expanded.y], [Infinity, -Infinity]);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'local get set delete'() {
            var key = '$mol_state_local_test:' + Math.random();
            $mol_assert_equal($mol_state_local.value(key), null);
            $mol_state_local.value(key, 123);
            $mol_assert_equal($mol_state_local.value(key), 123);
            $mol_state_local.value(key, null);
            $mol_assert_equal($mol_state_local.value(key), null);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test_mocks.push(context => {
        class $mol_state_local_mock extends $mol_state_local {
            static state = {};
            static value(key, next = this.state[key]) {
                return this.state[key] = (next || null);
            }
        }
        __decorate([
            $mol_mem_key
        ], $mol_state_local_mock, "value", null);
        context.$mol_state_local = $mol_state_local_mock;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    class TestClass extends Uint8Array {
    }
    $mol_test({
        'Uint8Array vs itself'() {
            $mol_assert_ok($mol_compare_array(new Uint8Array, new Uint8Array));
            $mol_assert_ok($mol_compare_array(new Uint8Array([0]), new Uint8Array([0])));
            $mol_assert_not($mol_compare_array(new Uint8Array([0]), new Uint8Array([1])));
        },
        'Uint8Array vs subclassed array'() {
            $mol_assert_not($mol_compare_array(new Uint8Array, new TestClass));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'decode utf8 string'() {
            const str = 'Hello, ΧΨΩЫ';
            const encoded = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 206, 167, 206, 168, 206, 169, 208, 171]);
            $mol_assert_equal($mol_charset_decode(encoded), str);
            $mol_assert_equal($mol_charset_decode(encoded, 'utf8'), str);
        },
        'decode empty string'() {
            const encoded = new Uint8Array([]);
            $mol_assert_equal($mol_charset_decode(encoded), '');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'encode empty'() {
            $mol_assert_equal($mol_charset_encode(''), new Uint8Array([]));
        },
        'encode 1 octet'() {
            $mol_assert_equal($mol_charset_encode('F'), new Uint8Array([0x46]));
        },
        'encode 2 octet'() {
            $mol_assert_equal($mol_charset_encode('Б'), new Uint8Array([0xd0, 0x91]));
        },
        'encode 3 octet'() {
            $mol_assert_equal($mol_charset_encode('ह'), new Uint8Array([0xe0, 0xa4, 0xb9]));
        },
        'encode 4 octet'() {
            $mol_assert_equal($mol_charset_encode('𐍈'), new Uint8Array([0xf0, 0x90, 0x8d, 0x88]));
        },
        'encode surrogate pair'() {
            $mol_assert_equal($mol_charset_encode('😀'), new Uint8Array([0xf0, 0x9f, 0x98, 0x80]));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'auto name'() {
            class Invalid extends $mol_error_mix {
            }
            const mix = new Invalid('foo');
            $mol_assert_equal(mix.name, 'Invalid_Error');
        },
        'simpe mix'() {
            const mix = new $mol_error_mix('foo', {}, new Error('bar'), new Error('lol'));
            $mol_assert_equal(mix.message, 'foo');
            $mol_assert_equal(mix.errors.map(e => e.message), ['bar', 'lol']);
        },
        'provide additional info'() {
            class Invalid extends $mol_error_mix {
            }
            const mix = new $mol_error_mix('Wrong password', {}, new Invalid('Too short', { value: 'p@ssw0rd', hint: '> 8 letters' }), new Invalid('Too simple', { value: 'p@ssw0rd', hint: 'need capital letter' }));
            const hints = [];
            if (mix instanceof $mol_error_mix) {
                for (const er of mix.errors) {
                    if (er instanceof Invalid) {
                        hints.push(er.cause?.hint ?? '');
                    }
                }
            }
            $mol_assert_equal(hints, ['> 8 letters', 'need capital letter']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            async "Get and parse"($) {
                $mol_assert_equal(await $mol_wire_async($mol_fetch).text('data:text/plain,foo'), 'foo');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $mol_locale_mock extends $mol_locale {
            lang(next = 'en') { return next; }
            static source(lang) {
                return {};
            }
        }
        __decorate([
            $mol_mem
        ], $mol_locale_mock.prototype, "lang", null);
        __decorate([
            $mol_mem_key
        ], $mol_locale_mock, "source", null);
        $.$mol_locale = $mol_locale_mock;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            'handle clicks by default'($) {
                let clicked = false;
                const clicker = $mol_button.make({
                    $,
                    click: (event) => { clicked = true; },
                });
                const element = clicker.dom_tree();
                const event = $mol_dom_context.document.createEvent('mouseevent');
                event.initEvent('click', true, true);
                element.dispatchEvent(event);
                $mol_assert_ok(clicked);
            },
            'no handle clicks if disabled'($) {
                let clicked = false;
                const clicker = $mol_button.make({
                    $,
                    click: (event) => { clicked = true; },
                    enabled: () => false,
                });
                const element = clicker.dom_tree();
                const event = $mol_dom_context.document.createEvent('mouseevent');
                event.initEvent('click', true, true);
                element.dispatchEvent(event);
                $mol_assert_not(clicked);
            },
            async 'Store error'($) {
                const clicker = $mol_button.make({
                    $,
                    click: (event) => $.$mol_fail(new Error('Test error')),
                });
                const event = $mol_dom_context.document.createEvent('mouseevent');
                $mol_assert_fail(() => clicker.event_activate(event), 'Test error');
                await Promise.resolve();
                $mol_assert_equal(clicker.status()[0].message, 'Test error');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'escape'() {
            const specials = $mol_regexp.from('.*+?^${}()|[]\\');
            $mol_assert_equal(specials.source, '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
        },
        'char code'() {
            const space = $mol_regexp.from(32);
            $mol_assert_like(' '.match(space), [' ']);
        },
        'repeat fixed'() {
            const { repeat, decimal_only: digit } = $mol_regexp;
            const year = repeat(digit, 4, 4);
            $mol_assert_like('#2020#'.match(year), ['2020']);
        },
        'greedy repeat'() {
            const { repeat, repeat_greedy, latin_only: letter } = $mol_regexp;
            $mol_assert_like('abc'.match(repeat(letter, 1, 2)), ['a', 'b', 'c']);
            $mol_assert_like('abc'.match(repeat_greedy(letter, 1, 2)), ['ab', 'c']);
        },
        'repeat range'() {
            const { repeat_greedy, decimal_only: digit } = $mol_regexp;
            const year = repeat_greedy(digit, 2, 4);
            $mol_assert_like('#2#'.match(year), null);
            $mol_assert_like('#20#'.match(year), ['20']);
            $mol_assert_like('#2020#'.match(year), ['2020']);
            $mol_assert_like('#20201#'.match(year), ['2020']);
        },
        'repeat from'() {
            const { repeat_greedy, latin_only: letter } = $mol_regexp;
            const name = repeat_greedy(letter, 2);
            $mol_assert_like('##'.match(name), null);
            $mol_assert_like('#a#'.match(name), null);
            $mol_assert_like('#ab#'.match(name), ['ab']);
            $mol_assert_like('#abc#'.match(name), ['abc']);
        },
        'from string'() {
            const regexp = $mol_regexp.from('[\\d]');
            $mol_assert_equal(regexp.source, '\\[\\\\d\\]');
            $mol_assert_equal(regexp.flags, 'gsu');
        },
        'from regexp'() {
            const regexp = $mol_regexp.from(/[\d]/i);
            $mol_assert_equal(regexp.source, '[\\d]');
            $mol_assert_equal(regexp.flags, 'i');
        },
        'split'() {
            const regexp = $mol_regexp.from(';');
            $mol_assert_like('aaa;bbb;ccc'.split(regexp), ['aaa', ';', 'bbb', ';', 'ccc']);
            $mol_assert_like('aaa;;ccc'.split(regexp), ['aaa', ';', '', ';', 'ccc']);
            $mol_assert_like('aaa'.split(regexp), ['aaa']);
            $mol_assert_like(''.split(regexp), ['']);
        },
        'test for matching'() {
            const regexp = $mol_regexp.from('foo');
            $mol_assert_like(regexp.test(''), false);
            $mol_assert_like(regexp.test('fo'), false);
            $mol_assert_like(regexp.test('foo'), true);
            $mol_assert_like(regexp.test('foobar'), true);
            $mol_assert_like(regexp.test('barfoo'), true);
        },
        'case ignoring'() {
            const xxx = $mol_regexp.from('x', { ignoreCase: true });
            $mol_assert_like(xxx.flags, 'gisu');
            $mol_assert_like(xxx.exec('xx')[0], 'x');
            $mol_assert_like(xxx.exec('XX')[0], 'X');
        },
        'multiline mode'() {
            const { end, from } = $mol_regexp;
            const xxx = from(['x', end], { multiline: true });
            $mol_assert_like(xxx.exec('x\ny')[0], 'x');
            $mol_assert_like(xxx.flags, 'gmsu');
        },
        'flags override'() {
            const triplet = $mol_regexp.from($mol_regexp.from(/.../, { ignoreCase: true }), { multiline: true });
            $mol_assert_like(triplet.toString(), '/.../gmsu');
        },
        'sequence'() {
            const { begin, end, decimal_only: digit, repeat, from } = $mol_regexp;
            const year = repeat(digit, 4, 4);
            const dash = '-';
            const month = repeat(digit, 2, 2);
            const day = repeat(digit, 2, 2);
            const date = from([begin, year, dash, month, dash, day, end]);
            $mol_assert_like(date.exec('2020-01-02')[0], '2020-01-02');
        },
        'optional'() {
            const name = $mol_regexp.from(['A', ['4']]);
            $mol_assert_equal('AB'.match(name)[0], 'A');
            $mol_assert_equal('A4'.match(name)[0], 'A4');
        },
        'anon variants'() {
            const name = $mol_regexp.from(['A', $mol_regexp.vary(['4', '5'])]);
            $mol_assert_equal('AB'.match(name), null);
            $mol_assert_equal('A4'.match(name)[0], 'A4');
            $mol_assert_equal('A5'.match(name)[0], 'A5');
        },
        'only groups'() {
            const regexp = $mol_regexp.from({ dog: '@' });
            $mol_assert_like([...'#'.matchAll(regexp)][0].groups, undefined);
            $mol_assert_like([...'@'.matchAll(regexp)][0].groups, { dog: '@' });
        },
        'catch skipped'() {
            const regexp = $mol_regexp.from(/(@)(\d?)/g);
            $mol_assert_like([...'[[@]]'.matchAll(regexp)].map(f => [...f]), [
                ['[['],
                ['@', '@', ''],
                [']]'],
            ]);
        },
        'enum variants'() {
            let Sex;
            (function (Sex) {
                Sex["male"] = "male";
                Sex["female"] = "female";
            })(Sex || (Sex = {}));
            const sexism = $mol_regexp.from(Sex);
            $mol_assert_like([...''.matchAll(sexism)].length, 0);
            $mol_assert_like([...'trans'.matchAll(sexism)][0].groups, undefined);
            $mol_assert_like([...'male'.matchAll(sexism)][0].groups, { male: 'male', female: '' });
            $mol_assert_like([...'female'.matchAll(sexism)][0].groups, { male: '', female: 'female' });
        },
        'recursive only groups'() {
            let Sex;
            (function (Sex) {
                Sex["male"] = "male";
                Sex["female"] = "female";
            })(Sex || (Sex = {}));
            const sexism = $mol_regexp.from({ Sex });
            $mol_assert_like([...''.matchAll(sexism)].length, 0);
            $mol_assert_like([...'male'.matchAll(sexism)][0].groups, { Sex: 'male', male: 'male', female: '' });
            $mol_assert_like([...'female'.matchAll(sexism)][0].groups, { Sex: 'female', male: '', female: 'female' });
        },
        'sequence with groups'() {
            const { begin, end, decimal_only: digit, repeat, from } = $mol_regexp;
            const year = repeat(digit, 4, 4);
            const dash = '-';
            const month = repeat(digit, 2, 2);
            const day = repeat(digit, 2, 2);
            const regexp = from([begin, { year }, dash, { month }, dash, { day }, end]);
            const found = [...'2020-01-02'.matchAll(regexp)];
            $mol_assert_like(found[0].groups, {
                year: '2020',
                month: '01',
                day: '02',
            });
        },
        'sequence with groups of mixed type'() {
            const prefix = '/';
            const postfix = '/';
            const regexp = $mol_regexp.from([{ prefix }, /(\w+)/, { postfix }, /([gumi]*)/]);
            $mol_assert_like([...'/foo/mi'.matchAll(regexp)], [
                Object.assign(["/foo/mi", "/", "foo", "/", "mi"], {
                    groups: {
                        prefix: '/',
                        postfix: '/',
                    },
                    index: 0,
                    input: "/",
                }),
            ]);
        },
        'recursive sequence with groups'() {
            const { begin, end, decimal_only: digit, repeat, from } = $mol_regexp;
            const year = repeat(digit, 4, 4);
            const dash = '-';
            const month = repeat(digit, 2, 2);
            const day = repeat(digit, 2, 2);
            const regexp = from([
                begin, { date: [{ year }, dash, { month }] }, dash, { day }, end
            ]);
            const found = [...'2020-01-02'.matchAll(regexp)];
            $mol_assert_like(found[0].groups, {
                date: '2020-01',
                year: '2020',
                month: '01',
                day: '02',
            });
        },
        'parse multiple'() {
            const { decimal_only: digit, from } = $mol_regexp;
            const regexp = from({ digit });
            $mol_assert_like([...'123'.matchAll(regexp)].map(f => f.groups), [
                { digit: '1' },
                { digit: '2' },
                { digit: '3' },
            ]);
        },
        'named variants'() {
            const { begin, or, end, from } = $mol_regexp;
            const sexism = from([
                begin, 'sex = ', { sex: ['male', or, 'female'] }, end
            ]);
            $mol_assert_like([...'sex = male'.matchAll(sexism)][0].groups, { sex: 'male' });
            $mol_assert_like([...'sex = female'.matchAll(sexism)][0].groups, { sex: 'female' });
            $mol_assert_like([...'sex = malefemale'.matchAll(sexism)][0].groups, undefined);
        },
        'force after'() {
            const { latin_only: letter, force_after, from } = $mol_regexp;
            const regexp = from([letter, force_after('.')]);
            $mol_assert_like('x.'.match(regexp), ['x']);
            $mol_assert_like('x,'.match(regexp), null);
        },
        'forbid after'() {
            const { latin_only: letter, forbid_after, from } = $mol_regexp;
            const regexp = from([letter, forbid_after('.')]);
            $mol_assert_like('x.'.match(regexp), null);
            $mol_assert_like('x,'.match(regexp), ['x']);
        },
        'char except'() {
            const { char_except, latin_only, tab } = $mol_regexp;
            const name = char_except(latin_only, tab);
            $mol_assert_like('a'.match(name), null);
            $mol_assert_like('\t'.match(name), null);
            $mol_assert_like('('.match(name), ['(']);
        },
        'unicode only'() {
            const { unicode_only, from } = $mol_regexp;
            const name = from([
                unicode_only('Script', 'Cyrillic'),
                unicode_only('Hex_Digit'),
            ]);
            $mol_assert_like('FF'.match(name), null);
            $mol_assert_like('ФG'.match(name), null);
            $mol_assert_like('ФF'.match(name), ['ФF']);
        },
        'generate by optional with inner group'() {
            const { begin, end, from } = $mol_regexp;
            const animals = from([begin, '#', ['^', { dog: '@' }], end]);
            $mol_assert_equal(animals.generate({}), '#');
            $mol_assert_equal(animals.generate({ dog: false }), '#');
            $mol_assert_equal(animals.generate({ dog: true }), '#^@');
            $mol_assert_fail(() => animals.generate({ dog: '$' }), 'Wrong param: dog=$');
        },
        'generate by optional with inner group with variants'() {
            const { begin, end, from } = $mol_regexp;
            const animals = from([begin, '#', ['^', { animal: { dog: '@', fox: '&' } }], end]);
            $mol_assert_equal(animals.generate({}), '#');
            $mol_assert_equal(animals.generate({ dog: true }), '#^@');
            $mol_assert_equal(animals.generate({ fox: true }), '#^&');
            $mol_assert_fail(() => animals.generate({ dog: '$' }), 'Wrong param: dog=$');
        },
        'complex example'() {
            const { begin, end, char_only, char_range, latin_only, slash_back, repeat_greedy, from, } = $mol_regexp;
            const atom_char = char_only(latin_only, "!#$%&'*+/=?^`{|}~-");
            const atom = repeat_greedy(atom_char, 1);
            const dot_atom = from([atom, repeat_greedy(['.', atom])]);
            const name_letter = char_only(char_range(0x01, 0x08), 0x0b, 0x0c, char_range(0x0e, 0x1f), 0x21, char_range(0x23, 0x5b), char_range(0x5d, 0x7f));
            const quoted_pair = from([
                slash_back,
                char_only(char_range(0x01, 0x09), 0x0b, 0x0c, char_range(0x0e, 0x7f))
            ]);
            const name = repeat_greedy({ name_letter, quoted_pair });
            const quoted_name = from(['"', { name }, '"']);
            const local_part = from({ dot_atom, quoted_name });
            const domain = dot_atom;
            const mail = from([begin, local_part, '@', { domain }, end]);
            $mol_assert_equal('foo..bar@example.org'.match(mail), null);
            $mol_assert_equal('foo..bar"@example.org'.match(mail), null);
            $mol_assert_like([...'foo.bar@example.org'.matchAll(mail)][0].groups, {
                dot_atom: "foo.bar",
                quoted_name: "",
                name: "",
                name_letter: "",
                quoted_pair: "",
                domain: "example.org",
            });
            $mol_assert_like([...'"foo..bar"@example.org'.matchAll(mail)][0].groups, {
                dot_atom: "",
                quoted_name: '"foo..bar"',
                name: "foo..bar",
                name_letter: "r",
                quoted_pair: "",
                domain: "example.org",
            });
            $mol_assert_equal(mail.generate({ dot_atom: 'foo.bar', domain: 'example.org' }), 'foo.bar@example.org');
            $mol_assert_equal(mail.generate({ name: 'foo..bar', domain: 'example.org' }), '"foo..bar"@example.org');
            $mol_assert_fail(() => mail.generate({ dot_atom: 'foo..bar', domain: 'example.org' }), 'Wrong param: dot_atom=foo..bar');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    var $$;
    (function ($$) {
        $mol_test({
            'Empty needle'() {
                const app = new $mol_dimmer;
                app.needle = () => '  ';
                app.haystack = () => 'foo  bar';
                $mol_assert_like(app.strings(), ['foo  bar']);
            },
            'Empty haystack'() {
                const app = new $mol_dimmer;
                app.needle = () => 'foo  bar';
                app.haystack = () => '';
                $mol_assert_like(app.strings(), ['']);
            },
            'Not found'() {
                const app = new $mol_dimmer;
                app.needle = () => 'foo';
                app.haystack = () => ' bar ';
                $mol_assert_like(app.strings(), [' bar ']);
            },
            'One found'() {
                const app = new $mol_dimmer;
                app.needle = () => 'foo';
                app.haystack = () => ' barfoo ';
                $mol_assert_like(app.strings(), [' bar', 'foo', ' ']);
            },
            'Multiple found'() {
                const app = new $mol_dimmer;
                app.needle = () => 'foo';
                app.haystack = () => ' foobarfoo foo';
                $mol_assert_like(app.strings(), [' ', 'foo', 'bar', 'foo', ' ', 'foo']);
            },
            'Fuzzy search'() {
                const app = new $mol_dimmer;
                app.needle = () => 'foo bar';
                app.haystack = () => ' barfoo ';
                $mol_assert_like(app.strings(), [' ', 'bar', '', 'foo', ' ']);
            },
        });
    })($$ = $.$$ || ($.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            'skin puts presets on the host node'($) {
                class Host extends $mol_view {
                    Skin() {
                        return $bog_builderui_skin.make({ $: this.$, base: () => 'stone' });
                    }
                    plugins() {
                        return [this.Skin()];
                    }
                }
                __decorate([
                    $mol_mem
                ], Host.prototype, "Skin", null);
                const host = Host.make({ $ });
                host.dom_tree();
                const node = host.dom_node();
                $mol_assert_equal(node.getAttribute('bog_builderui_base'), 'stone');
                $mol_assert_equal(node.getAttribute('bog_builderui_lights'), 'system');
                $mol_assert_equal(node.getAttribute('bog_builderui_theme'), 'sky');
                $mol_assert_equal(node.getAttribute('bog_builderui_radius'), 'medium');
                $mol_assert_equal(node.getAttribute('mol_theme'), null);
                host.destructor();
            },
            'skin stops input zoom on ios only'($) {
                const zoom_after = (agent) => {
                    const meta = { content: 'width=device-width, initial-scale=1', getAttribute: () => meta.content, setAttribute: (_, val) => { meta.content = val; } };
                    const document = { querySelector: () => meta };
                    const context = { ...$.$mol_dom_context, document, navigator: { userAgent: agent, platform: '', maxTouchPoints: 0 } };
                    const skin = $bog_builderui_skin.make({ $: $.$mol_ambient({ $mol_dom_context: context }) });
                    skin.ios_zoom_fix();
                    skin.ios_zoom_fix();
                    return meta.content;
                };
                $mol_assert_equal(zoom_after('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'), 'width=device-width, initial-scale=1, maximum-scale=1');
                $mol_assert_equal(zoom_after('Mozilla/5.0 (Linux; Android 14)'), 'width=device-width, initial-scale=1');
            },
            'skin follows the host'($) {
                class Host extends $mol_view {
                    lights(next) {
                        return next ?? 'dark';
                    }
                    Skin() {
                        return $bog_builderui_skin.make({ $: this.$, lights: () => this.lights() });
                    }
                    plugins() {
                        return [this.Skin()];
                    }
                }
                __decorate([
                    $mol_mem
                ], Host.prototype, "lights", null);
                __decorate([
                    $mol_mem
                ], Host.prototype, "Skin", null);
                const host = Host.make({ $ });
                host.dom_tree();
                $mol_assert_equal(host.dom_node().getAttribute('bog_builderui_lights'), 'dark');
                host.lights('light');
                host.dom_tree();
                $mol_assert_equal(host.dom_node().getAttribute('bog_builderui_lights'), 'light');
                host.destructor();
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push(context => {
        class $mol_state_arg_mock extends $mol_state_arg {
            static $ = context;
            static href(next) { return next || ''; }
            static go(next) {
                this.href(this.link(next));
            }
        }
        __decorate([
            $mol_mem
        ], $mol_state_arg_mock, "href", null);
        __decorate([
            $mol_action
        ], $mol_state_arg_mock, "go", null);
        context.$mol_state_arg = $mol_state_arg_mock;
    });
    $mol_test({
        'args as dictionary'($) {
            $.$mol_state_arg.href('#!foo=bar/xxx');
            $mol_assert_equal($.$mol_state_arg.dict(), { foo: 'bar', xxx: '' });
            $.$mol_state_arg.dict({ foo: null, yyy: '', lol: '123' });
            $mol_assert_equal($.$mol_state_arg.href().replace(/.*#/, '#'), '#!yyy/lol=123');
        },
        'one value from args'($) {
            $.$mol_state_arg.href('#!foo=bar/xxx');
            $mol_assert_equal($.$mol_state_arg.value('foo'), 'bar');
            $mol_assert_equal($.$mol_state_arg.value('xxx'), '');
            $.$mol_state_arg.value('foo', 'lol');
            $mol_assert_equal($.$mol_state_arg.href().replace(/.*#/, '#'), '#!foo=lol/xxx');
            $.$mol_state_arg.value('foo', '');
            $mol_assert_equal($.$mol_state_arg.href().replace(/.*#/, '#'), '#!foo/xxx');
            $.$mol_state_arg.value('foo', null);
            $mol_assert_equal($.$mol_state_arg.href().replace(/.*#/, '#'), '#!xxx');
        },
        'nested args'($) {
            const base = new $.$mol_state_arg('nested.');
            class Nested extends $mol_state_arg {
                constructor(prefix) {
                    super(base.prefix + prefix);
                }
                static value = (key, next) => base.value(key, next);
            }
            $.$mol_state_arg.href('#!foo=bar/nested.xxx=123');
            $mol_assert_equal(Nested.value('foo'), null);
            $mol_assert_equal(Nested.value('xxx'), '123');
            Nested.value('foo', 'lol');
            $mol_assert_equal($.$mol_state_arg.href().replace(/.*#/, '#'), '#!foo=bar/nested.xxx=123/nested.foo=lol');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'null by default'() {
            const key = String(Math.random());
            $mol_assert_equal($mol_state_session.value(key), null);
        },
        'storing'() {
            const key = String(Math.random());
            $mol_state_session.value(key, '$mol_state_session_test');
            $mol_assert_equal($mol_state_session.value(key), '$mol_state_session_test');
            $mol_state_session.value(key, null);
            $mol_assert_equal($mol_state_session.value(key), null);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'system mode follows the device, not a light choice stored by another app'($) {
            const device = (light) => {
                const context = Object.create($);
                context.$mol_lights = () => !light;
                context.$mol_media = class extends $.$mol_media {
                    static match() {
                        return light;
                    }
                };
                return $bog_theme_auto.make({ $: context });
            };
            const night = device(false);
            $mol_assert_equal(night.mode(), 'system');
            $mol_assert_equal(night.theme(), night.theme_dark());
            $mol_assert_equal(night.is_light_now(), false);
            const day = device(true);
            $mol_assert_equal(day.theme(), day.theme_light());
            $mol_assert_equal(day.is_light_now(), true);
        },
    });
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
var $;
(function ($) {
    $mol_test({
        'safe tag'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("div", null, "foo")])[0]), $mol_dom_serialize($mol_jsx("div", null, "foo")));
        },
        'bad tag'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("script", null, "alert('ahtung!')")])[0]), $mol_dom_serialize($mol_jsx($mol_jsx_frag, null, "alert('ahtung!')")));
        },
        'common attr'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("a", { id: "foo" }, "foo")])[0]), $mol_dom_serialize($mol_jsx("a", { id: "foo" }, "foo")));
        },
        'safe attr'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("a", { href: "https://example.org/" }, "foo")])[0]), $mol_dom_serialize($mol_jsx("a", { href: "https://example.org/" }, "foo")));
        },
        'bad attr'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("a", { onclick: "alert('ahtung!')" }, "foo")])[0]), $mol_dom_serialize($mol_jsx("a", null, "foo")));
        },
        'danger attr'() {
            $mol_assert_equal($mol_dom_serialize($$.$mol_dom_safe([$mol_jsx("a", { href: "javascript:alert('ahtung!')" }, "foo")])[0]), $mol_dom_serialize($mol_jsx("a", { href: "about:blank#javascript:alert('ahtung!')" }, "foo")));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Watch one value'($) {
            class App extends $mol_object2 {
                static $ = $;
                static set = new $mol_wire_set();
                static lucky() {
                    return this.set.has(777);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "lucky", null);
            $mol_assert_equal(App.lucky(), false);
            App.set.add(666);
            $mol_assert_equal(App.lucky(), false);
            App.set.add(777);
            $mol_assert_equal(App.lucky(), true);
            App.set.delete(777);
            $mol_assert_equal(App.lucky(), false);
        },
        'Watch item channel'($) {
            class App extends $mol_object2 {
                static $ = $;
                static set = new $mol_wire_set();
                static lucky() {
                    return this.set.item(777);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "lucky", null);
            $mol_assert_equal(App.lucky(), false);
            App.set.item(666, true);
            $mol_assert_equal(App.lucky(), false);
            App.set.item(777, true);
            $mol_assert_equal(App.lucky(), true);
            App.set.item(777, false);
            $mol_assert_equal(App.lucky(), false);
        },
        'Watch size'($) {
            class App extends $mol_object2 {
                static $ = $;
                static set = new $mol_wire_set();
                static size() {
                    return this.set.size;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "size", null);
            $mol_assert_equal(App.size(), 0);
            App.set.add(666);
            $mol_assert_equal(App.size(), 1);
            App.set.add(777);
            $mol_assert_equal(App.size(), 2);
            App.set.delete(777);
            $mol_assert_equal(App.size(), 1);
        },
        'Watch for-of'($) {
            class App extends $mol_object2 {
                static $ = $;
                static set = new $mol_wire_set();
                static sum() {
                    let res = 0;
                    for (const val of this.set) {
                        res += val;
                    }
                    return res;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "sum", null);
            $mol_assert_equal(App.sum(), 0);
            App.set.add(111);
            $mol_assert_equal(App.sum(), 111);
            App.set.add(222);
            $mol_assert_equal(App.sum(), 333);
            App.set.delete(111);
            $mol_assert_equal(App.sum(), 222);
        },
        'Watch forEach'($) {
            class App extends $mol_object2 {
                static $ = $;
                static set = new $mol_wire_set();
                static sum() {
                    let res = 0;
                    this.set.forEach(val => res += val);
                    return res;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "sum", null);
            $mol_assert_equal(App.sum(), 0);
            App.set.add(111);
            $mol_assert_equal(App.sum(), 111);
            App.set.add(222);
            $mol_assert_equal(App.sum(), 333);
            App.set.delete(111);
            $mol_assert_equal(App.sum(), 222);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const png = new Uint8Array([0x1a, 0x0a, 0x00, 0x49, 0x48, 0x78, 0xda]);
    $mol_test({
        'base64 encode string'() {
            $mol_assert_equal($mol_base64_encode($mol_charset_encode('Hello, ΧΨΩЫ')), 'SGVsbG8sIM6nzqjOqdCr');
        },
        'base64 encode binary'() {
            $mol_assert_equal($mol_base64_encode(png), 'GgoASUh42g==');
        },
        'base64 encode string with plus'() {
            $mol_assert_equal($mol_base64_encode($mol_charset_encode('шоешпо')), '0YjQvtC10YjQv9C+');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const png = new Uint8Array([0x1a, 0x0a, 0x00, 0x49, 0x48, 0x78, 0xda]);
    const with_plus = new TextEncoder().encode('шоешпо');
    $mol_test({
        'base64 decode string'() {
            $mol_assert_equal($mol_base64_decode('SGVsbG8sIM6nzqjOqdCr'), new TextEncoder().encode('Hello, ΧΨΩЫ'));
        },
        'base64 decode binary'() {
            $mol_assert_equal($mol_base64_decode('GgoASUh42g=='), png);
        },
        'base64 decode binary - without equals'() {
            $mol_assert_equal($mol_base64_decode('GgoASUh42g'), png);
        },
        'base64 decode with plus'() {
            $mol_assert_equal($mol_base64_decode('0YjQvtC10YjQv9C+'), with_plus);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'empty hash'() {
            $mol_assert_equal($mol_crypto2_hash(new Uint8Array([])), new Uint8Array([218, 57, 163, 238, 94, 107, 75, 13, 50, 85, 191, 239, 149, 96, 24, 144, 175, 216, 7, 9]));
        },
        'three bytes hash'() {
            $mol_assert_equal($mol_crypto2_hash(new Uint8Array([255, 254, 253])), new Uint8Array([240, 150, 38, 243, 255, 128, 96, 0, 72, 215, 207, 228, 19, 149, 113, 52, 2, 125, 27, 77]));
        },
        'six bytes hash'() {
            $mol_assert_equal($mol_crypto2_hash(new Uint8Array([0, 255, 10, 250, 32, 128])), new Uint8Array([23, 25, 155, 181, 46, 200, 221, 83, 254, 0, 166, 68, 91, 255, 67, 140, 114, 88, 218, 155]));
        },
        'seven bytes hash'() {
            $mol_assert_equal($mol_crypto2_hash(new Uint8Array([1, 2, 3, 4, 5, 6, 7])), new Uint8Array([140, 31, 40, 252, 47, 72, 194, 113, 214, 196, 152, 240, 242, 73, 205, 222, 54, 92, 84, 197]));
        },
        'unaligned hash'() {
            const data = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
            $mol_assert_equal($mol_crypto2_hash(new Uint8Array(data.buffer, 1, 7)), new Uint8Array([140, 31, 40, 252, 47, 72, 194, 113, 214, 196, 152, 240, 242, 73, 205, 222, 54, 92, 84, 197]));
        },
        async 'reference'() {
            const data = new Uint8Array([255, 254, 253]);
            $mol_assert_equal($mol_crypto2_hash(data), new Uint8Array(await $mol_crypto_native.subtle.digest('SHA-1', data)));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Float schema"($) {
                $mol_assert_equal('$mol_schema_float', $mol_schema_float + '', $mol_key($mol_schema_float));
                $mol_assert_equal(true, $mol_schema_float.check(0));
                $mol_assert_equal(true, $mol_schema_float.check(Number.NaN));
                $mol_assert_equal(true, $mol_schema_float.check(Number.POSITIVE_INFINITY));
                $mol_assert_equal(false, $mol_schema_float.check(null));
                $mol_assert_equal(1.5, $mol_schema_float.cast(1.5));
                $mol_assert_equal(Number.NaN, $mol_schema_float.cast('0'));
                $mol_assert_equal(Number.EPSILON, $mol_schema_float.guard(Number.EPSILON));
                $mol_assert_fail(() => $mol_schema_float.guard('0'), 'Wrong type');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "String schema"($) {
                $mol_assert_equal('$mol_schema_string', $mol_schema_string + '', $mol_key($mol_schema_string));
                $mol_assert_equal(true, $mol_schema_string.check('foo'));
                $mol_assert_equal(false, $mol_schema_string.check(123));
                $mol_assert_equal('foo', $mol_schema_string.cast('foo'));
                $mol_assert_equal('', $mol_schema_string.cast(123));
                $mol_assert_equal('foo', $mol_schema_string.guard('foo'));
                $mol_assert_fail(() => $mol_schema_string.guard(123), 'Wrong type');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Cache of maybe schema"($) {
                $mol_assert_equal($mol_schema_maybe($mol_schema_float), $mol_schema_maybe($mol_schema_float));
                $mol_assert_unique($mol_schema_maybe($mol_schema_float), $mol_schema_maybe($mol_schema_string));
            },
            "Optional value"($) {
                const Config = $mol_schema_maybe($mol_schema_string);
                $mol_assert_equal('$mol_schema_maybe<$mol_schema_string>', Config + '');
                $mol_assert_equal(true, Config.check('foo'));
                $mol_assert_equal(true, Config.check(undefined));
                $mol_assert_equal(true, Config.check(null));
                $mol_assert_equal(false, Config.check(0));
                $mol_assert_equal('foo', Config.cast('foo'));
                $mol_assert_equal(undefined, Config.cast(undefined));
                $mol_assert_equal(null, Config.cast(null));
                $mol_assert_equal(null, Config.cast(0));
                $mol_assert_equal('foo', Config.guard('foo'));
                $mol_assert_fail(() => Config.guard(123), 'Wrong type');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Cache of instance schema"($) {
                $mol_assert_equal($mol_schema_instance(Uint8Array), $mol_schema_instance(Uint8Array));
                $mol_assert_unique($mol_schema_instance(Uint8Array), $mol_schema_instance(Int8Array));
            },
            "Class instance schema"($) {
                const Blob = $mol_schema_instance(Uint8Array);
                $mol_assert_equal('$mol_schema_instance<Uint8Array>', Blob + '', $mol_key(Blob));
                $mol_assert_equal(true, Blob.check(new Uint8Array));
                $mol_assert_equal(false, Blob.check(new Int8Array));
                $mol_assert_equal(false, Blob.check(null));
                $mol_assert_equal(new Uint8Array([0, 1]), Blob.cast(new Uint8Array([0, 1])));
                $mol_assert_fail(() => Blob.cast(new Int8Array), 'Wrong class');
                $mol_assert_equal(new Uint8Array, Blob.guard(new Uint8Array));
                $mol_assert_fail(() => Blob.guard(new Int8Array), 'Wrong class');
            },
            "Boxed instance schema"($) {
                const Str = $mol_schema_instance(String);
                $mol_assert_equal('$mol_schema_instance<String>', Str + '', $mol_key(Str));
                $mol_assert_equal(true, Str.check(Object('')));
                $mol_assert_equal(true, Str.check(''));
                $mol_assert_equal(true, Object('') instanceof Str);
            },
            "Schema instance schema"($) {
                const Str = $mol_schema_instance($mol_schema_instance(String));
                $mol_assert_equal('$mol_schema_instance<String>', Str + '', $mol_key(Str));
                $mol_assert_equal(true, Str.check(Object('')));
                $mol_assert_equal(true, Str.check(''));
                $mol_assert_equal(true, Object('') instanceof Str);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Validation"($) {
                $mol_assert_fail(() => new $giper_baza_link('qwertyui_asdfghjk123'), 'Wrong Link');
            },
            "From integer"($) {
                $mol_assert_equal($giper_baza_link.from_int(178308648732587), new $giper_baza_link('qwertyui'));
            },
            "Pick Lord only"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').lord(), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').lord(), new $giper_baza_link('qwertyui_asdfghjk').lord(), new $giper_baza_link('qwertyui_asdfghjk'));
            },
            "Pick Land only"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').land(), new $giper_baza_link('qwertyui_asdfghjk').land(), new $giper_baza_link('qwertyui_asdfghjk'));
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').land(), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').land(), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed'));
            },
            "Pick Peer only"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').peer(), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').peer(), new $giper_baza_link('qwertyui'));
                $mol_assert_equal(new $giper_baza_link('___qazwsxed').peer(), new $giper_baza_link(''));
            },
            "Pick Head only"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').head(), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').head(), new $giper_baza_link('zxcvbnm0'));
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').head(), new $giper_baza_link('qwertyui_asdfghjk').head(), new $giper_baza_link(''));
            },
            "Pick Area only"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').area(), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').area(), new $giper_baza_link('qazwsxed'));
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').area(), new $giper_baza_link('qwertyui_asdfghjk').area(), new $giper_baza_link('').area(), new $giper_baza_link(''));
            },
            "Binary encoding"($) {
                const pawn = new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').toBin();
                const land = new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').toBin();
                const lord = new $giper_baza_link('qwertyui_asdfghjk').toBin();
                const rel_pawn = new $giper_baza_link('___zxcvbnm0').toBin();
                const rel_root = new $giper_baza_link('').toBin();
                $mol_assert_equal(pawn.length, 24);
                $mol_assert_equal(land.length, 18);
                $mol_assert_equal(lord.length, 12);
                $mol_assert_equal(rel_pawn.length, 6);
                $mol_assert_equal(rel_root.length, 0);
                $mol_assert_equal($giper_baza_link.from_bin(pawn), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0'));
                $mol_assert_equal($giper_baza_link.from_bin(land), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed'));
                $mol_assert_equal($giper_baza_link.from_bin(lord), new $giper_baza_link('qwertyui_asdfghjk'));
                $mol_assert_equal($giper_baza_link.from_bin(rel_pawn), new $giper_baza_link('zxcvbnm0'));
                $mol_assert_equal($giper_baza_link.from_bin(rel_root), new $giper_baza_link(''));
            },
            "Relate to base"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').relate(new $giper_baza_link('QWERTYUI_ASDFGHJK')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').relate(new $giper_baza_link('QWERTYUI_ASDFGHJK__ZXCVBNM0')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0'));
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').relate(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed')), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0').relate(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_12345678')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').relate(new $giper_baza_link('qwertyui_asdfghjk')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').relate(new $giper_baza_link('qwertyui_asdfghjk__12345678')), new $giper_baza_link('___zxcvbnm0'));
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').relate(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed').relate(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed')), new $giper_baza_link('qwertyui_asdfghjk').relate(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk').relate(new $giper_baza_link('qwertyui_asdfghjk')), new $giper_baza_link(''));
            },
            "Resolve Link from base"($) {
                $mol_assert_equal(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').resolve(new $giper_baza_link('QWERTYUI_ASDFGHJK__ZXCVBNM0')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').resolve(new $giper_baza_link('QWERTYUI_ASDFGHJK')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0').resolve(new $giper_baza_link('qwertyui_asdfghjk')), new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0'));
                $mol_assert_equal(new $giper_baza_link('___12345678').resolve(new $giper_baza_link('qwertyui_asdfghjk')), new $giper_baza_link('___12345678').resolve(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk__12345678'));
                $mol_assert_equal(new $giper_baza_link('___12345678').resolve(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed')), new $giper_baza_link('___12345678').resolve(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_12345678'));
                $mol_assert_equal(new $giper_baza_link('').resolve(new $giper_baza_link('qwertyui_asdfghjk')), new $giper_baza_link('').resolve(new $giper_baza_link('qwertyui_asdfghjk__zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk'));
                $mol_assert_equal(new $giper_baza_link('').resolve(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed')), new $giper_baza_link('').resolve(new $giper_baza_link('qwertyui_asdfghjk_qazwsxed_zxcvbnm0')), new $giper_baza_link('qwertyui_asdfghjk_qazwsxed'));
            },
            'Hashing'() {
                $mol_assert_equal($giper_baza_link.hash_bin(new Uint8Array([1, 2, 3])), new $giper_baza_link('cDeAcZjC_Kn0rCAc3'));
                $mol_assert_equal($giper_baza_link.hash_str('foo bar'), new $giper_baza_link('N3PeplFW_kJg4æmwi'));
            }
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'str & bin sizes'() {
            const signer = await $$.$mol_crypto2_signer.generate();
            const auditor = signer.auditor();
            $mol_assert_equal(signer.toStringPrivate().length, $mol_crypto2_signer.size_str);
            $mol_assert_equal(auditor.toString().length, $mol_crypto2_auditor.size_str);
            $mol_assert_equal(signer.asArrayPrivate().length, $mol_crypto2_signer.size_bin);
            $mol_assert_equal(auditor.asArray().length, $mol_crypto2_auditor.size_bin);
            const data = new Uint8Array([1, 2, 3]);
            const sign = await signer.sign(data);
            $mol_assert_equal(sign.byteLength, $mol_crypto2_signer.size_sign);
        },
        async 'verify self signed with auto generated key'() {
            const Alice = await $$.$mol_crypto2_signer.generate();
            const data = new Uint8Array([1, 2, 3]);
            const sign = await Alice.sign(data);
            $mol_assert_equal(true, await Alice.auditor().verify(data, sign));
        },
        async 'verify signed with str exported auto generated key'() {
            const Alice = await $$.$mol_crypto2_signer.generate();
            const data = new Uint8Array([1, 2, 3]);
            const Bella = $mol_crypto2_signer.from(Alice.toString() + Alice.toStringPrivate());
            const sign = await Bella.sign(data);
            const Catie = $mol_crypto2_auditor.from(Alice.auditor().toString());
            $mol_assert_equal(true, await Catie.verify(data, sign));
            const Diana = $mol_crypto2_auditor.from(Alice.toString());
            $mol_assert_equal(true, await Diana.verify(data, sign));
        },
        async 'verify signed with bin exported auto generated key'() {
            const Alice = await $$.$mol_crypto2_signer.generate();
            const data = new Uint8Array([1, 2, 3]);
            const Bella = $mol_crypto2_signer.from(new Uint8Array([...Alice.asArray(), ...Alice.asArrayPrivate()]));
            const sign = await Bella.sign(data);
            const Catie = $mol_crypto2_auditor.from(Alice.auditor().asArray());
            $mol_assert_equal(true, await Catie.verify(data, sign));
            const Diana = $mol_crypto2_auditor.from(Alice.asArray());
            $mol_assert_equal(true, await Diana.verify(data, sign));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'Sizes'() {
            const secret = $mol_crypto2_secret.make();
            $mol_assert_equal(secret.asArray().byteLength, $mol_crypto2_secret.size);
            const data = new Uint8Array([1, 2, 3]);
            const nonce = $mol_crypto2_nonce();
            const closed = await secret.encrypt(data, nonce);
            $mol_assert_equal(closed.byteLength, data.byteLength);
        },
        'Wrong key size'() {
            $mol_assert_fail(() => $mol_crypto2_secret.from(new Uint8Array(8)), 'Wrong key size');
        },
        async 'Decrypt self encrypted'() {
            const secret = $mol_crypto2_secret.make();
            const nonce = $mol_crypto2_nonce();
            const data = new Uint8Array([1, 2, 3]);
            const closed = await secret.encrypt(data, nonce);
            $mol_assert_equal(closed.byteLength, 3);
            const opened = await secret.decrypt(closed, nonce);
            $mol_assert_equal(opened, data);
        },
        async 'Decrypt encrypted with exported key'() {
            const data = new Uint8Array([1, 2, 3]);
            const nonce = $mol_crypto2_nonce();
            const Alice = $mol_crypto2_secret.make();
            const closed = await Alice.encrypt(data, nonce);
            const Bob = $mol_crypto2_secret.from(Alice.asArray());
            const opened = await Bob.decrypt(closed, nonce);
            $mol_assert_equal(data, opened);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'str & bin sizes'() {
            const cipher = await $$.$mol_crypto2_cipher.generate();
            const socket = cipher.socket();
            $mol_assert_equal(cipher.toStringPrivate().length, $mol_crypto2_cipher.size_str);
            $mol_assert_equal(socket.toString().length, $mol_crypto2_socket.size_str);
            $mol_assert_equal(cipher.asArrayPrivate().length, $mol_crypto2_cipher.size_bin);
            $mol_assert_equal(socket.asArray().length, $mol_crypto2_socket.size_bin);
            const secret = await cipher.secret(socket);
            $mol_assert_equal(secret.byteLength, $mol_crypto2_cipher.size_secret);
        },
        async 'Shared secret from public & private keys'() {
            const A = await $mol_crypto2_cipher.generate();
            const B = await $mol_crypto2_cipher.generate();
            const SA = await A.secret(B.socket());
            const SB = await B.secret(A.socket());
            $mol_assert_equal(SA.asArray(), SB.asArray());
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            async "Signing & encryption"($) {
                const Alice = await $mol_crypto2_private.generate();
                const Bella = await $mol_crypto2_private.generate();
                const secretA = await Alice.cipher().secret(Bella.socket());
                const secretB = await Bella.cipher().secret(Alice.socket());
                $mol_assert_equal(secretA, secretB);
                const data = new Uint8Array([1, 2, 3]);
                const nonce = $mol_crypto2_nonce();
                const closed = await secretA.encrypt(data, nonce);
                const digest = $mol_crypto2_hash(closed);
                const sign = await Alice.signer().sign(digest);
                $mol_assert_equal(true, await Alice.auditor().verify(digest, sign));
                $mol_assert_equal(data, await secretA.decrypt(closed, nonce));
            },
            async "Serial & Deserial"($) {
                const orig = await $mol_crypto2_private.generate();
                const bin = new Uint8Array([...orig.asArray(), ...orig.asArrayPrivate()]);
                const str = orig.toString() + orig.toStringPrivate();
                $mol_assert_equal(orig, $mol_crypto2_private.from(bin), $mol_crypto2_private.from(str));
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $giper_baza_auth_mock extends $.$giper_baza_auth {
            static current() {
                return this.from('_7uaNxSijvQDjZ-9a9r22hpcROZwhgBTaWZrcDIMwkU3e6xFHq_7h9-Dfxgif7E_szNlubYXJLUWFNt8x5ko3wb0YsrNPmwb8tahStoyKB_J5_gj8LqmJItGnwJHsGmRs17BgVIMzCEMbNqhiBiz6-dkW9PFWp346RUya2lNHzpk');
            }
            static embryos = [
                '_7bJySpjwMJr-9xpQtl3XIQhiiHIAJ3mJGJ9Z8XJXOMbKLhjUHMrA4RZzmscCgO0c7xnXnw_UFhwhDN7CRHOTca4x_vAJdIvjnNNRkBaYqJJRHBiLn6Cjf1Iv7ZYsHBZQZ72WxwYK8xKs8L3Kokv5RZ-jqBoozqc8JIFI1DWayJM',
                '_zOldFN6un21Kk9V_Z51D84ZJXdDoSfkxZZl5iNdSJ8mN-zcOuKh0tUTajmynoVmYG73krPQXIkIlGLAEwx5n03Fju-SIG0_fENxSNDRH8Pukvibs6nnMDPgXCYRvJi6gL8ZVwedP7LYkwa1qpsaUN7nmjWvhkkgVcVMLYK0Jk7g',
                '_8-GDFlnyEYoMzoeCiH1H7lBLuqMyZ1S_2ZEt0o4YIE4frZ1syTbDar0RqkFzC78BhVCYVykYxDTewnzyq4nEwG3y1Al3BskP59eYuDeaH0UKbBNF407K7kGJrMpJXZtMj0kZdX16E3aKfUmeLp0NL9VWFrAg6QiVQd1jJ5-MU5w',
                '_9GnExCEqMmBM5nBUnfdGBPjYSVHOUjHygAFipsPU0UU8mOgMS9JC8Wwkv0waX-JgfPrI_em3gPznH-2_C9MDcP03zEmIAoLRltMEBftax-lHJ52kciH3GUFAdQ1glc9Ej8ypgYHvfvO5gkQA6q0DhCEcWUPkOok5OvJre6iO358',
                '_y1XB55LywSvOEtuyr_hh3wjRaW7gFW_aebG1eSQFmcFTzFvw50xd9Vft_jXFvP3Cd9T4jL-eIPMizBX9gafRcaW8XDdjaWW6GDCJLeXBSoFQH4PpNjufNT7BaPCZfAwY_12rLEO66Pse1GrzdVHU6wSOciL99w56zQLgzFLHErc',
                '_62jup6y61Rt8SN8Oq1Lzu5GXA_WL7oxoRPkRPQNkiwvKz8z4D2p8g_Qa5QWvBYmFrgBwAZmarD1UJ1ucA_zUQbrgMUBmEiYv7S4AApUa1Obo6r2KQ_70BebGOo_F3lNUtzfNxEnMh4FRLShzu0hLlp6gZyFjW7aZKoqLRXR68bw',
                '_yXB4FEZnF35nrJxHpsiS3YB18ADNOwbrKIYKcXAdpAIjWy6A4-Nx6K44RWNvgnreWlACm6PaaymM6he1TaCAAyS8ouYHqSezBbGRPyKmKVXjcyHYfQ33W3tQvipwLM8YB3VcOAuvRBNaiQLLzPb9saE5HT2cU25EJE34hpAVm6I',
                '_6iVZXF5fD2ztELDFvmhTAJWMRNLBMRv3W6GArqcVLwcCM6WeoqPAySo05cG-XaqXTme0iC3Pzf5jvlHqY1GgAO4qfQcF3EWV66Uw9sYD1T_tu_rmKYjYT5YXyaxtki08r50YHA-Jw4obKcDHt6_sDONANUA7pCYjIeFGt0mv1Zs',
                '_yPV-YZgPu0_edJc3I8o1SUKqUucgYVKlbTrKqVyl3sxjQo3u73nGtQq190q3W_ebhVnQWLC8A4JFhbjWDCTzY8i7shadOvvSEeAfuPqsyK5JERqw-tbJm_0nvR8bShIcXzyrYDIg_ZBU_wNKbFzoCXHmh-CNsuKpb6NyBQPsIrU',
                '_-67MXDuic5c7e4Febc1QuI456bgmfeMnmp3rWcGWzcMIPytythDMqmZISsGGsLVFUOQxsGjm7s3ULV-307L3wd47B4K4BtUhTR5cyKMI4y5Ld-UstbevtgOURqLsc_XIhyFilGTJ8ORTRW7RI3O83xtRu-_0lRg9WcmnhWERBIU',
            ];
        }
        __decorate([
            $mol_mem
        ], $giper_baza_auth_mock, "current", null);
        $.$giper_baza_auth = $giper_baza_auth_mock;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'ordered links'() {
            var graph = new $mol_graph();
            graph.link('A', 'B', 'E');
            $mol_assert_equal(graph.edge_out('A', 'B'), 'E');
            $mol_assert_equal(graph.edge_in('B', 'A'), 'E');
            $mol_assert_equal(graph.edge_out('B', 'A'), null);
            $mol_assert_equal(graph.edge_in('A', 'B'), null);
        },
        'nodes without edges'() {
            var graph = new $mol_graph();
            graph.nodes.add('A');
            graph.nodes.add('B');
            graph.nodes.add('C');
            graph.nodes.add('D');
            graph.acyclic(edge => 0);
            $mol_assert_equal([...graph.sorted].join(''), 'ABCD');
        },
        'partial ordering'() {
            var graph = new $mol_graph();
            graph.nodes.add('A');
            graph.nodes.add('B');
            graph.nodes.add('C');
            graph.nodes.add('D');
            graph.link('B', 'C', { priority: 0 });
            graph.acyclic(edge => edge.priority);
            $mol_assert_equal([...graph.sorted].join(''), 'ACBD');
        },
        'sorting must cut cycles at low priority edges A'() {
            var graph = new $mol_graph();
            graph.link('A', 'B', { priority: 0 });
            graph.link('B', 'C', { priority: -2 });
            graph.link('C', 'D', { priority: 0 });
            graph.link('D', 'A', { priority: -1 });
            graph.acyclic(edge => edge.priority);
            $mol_assert_equal([...graph.sorted].join(''), 'BADC');
        },
        'sorting must cut cycles at low priority edges B'() {
            var graph = new $mol_graph();
            graph.link('B', 'C', { priority: -2 });
            graph.link('C', 'D', { priority: 0 });
            graph.link('D', 'A', { priority: -1 });
            graph.link('A', 'B', { priority: 0 });
            graph.acyclic(edge => edge.priority);
            $mol_assert_equal([...graph.sorted].join(''), 'BADC');
        },
        'sorting must cut cycles at low priority edges C'() {
            var graph = new $mol_graph();
            graph.link('C', 'D', { priority: 0 });
            graph.link('D', 'A', { priority: -1 });
            graph.link('A', 'B', { priority: 0 });
            graph.link('B', 'C', { priority: -2 });
            graph.acyclic(edge => edge.priority);
            $mol_assert_equal([...graph.sorted].join(''), 'BADC');
        },
        'sorting must cut cycles at low priority edges D'() {
            var graph = new $mol_graph();
            graph.link('D', 'A', { priority: -1 });
            graph.link('A', 'B', { priority: 0 });
            graph.link('B', 'C', { priority: -2 });
            graph.link('C', 'D', { priority: 0 });
            graph.acyclic(edge => edge.priority);
            $mol_assert_equal([...graph.sorted].join(''), 'BADC');
        },
        'sorting must group cutted cycles'() {
            var graph = new $mol_graph();
            graph.link('A', 'B', 0);
            graph.link('B', 'C', 0);
            graph.link('C', 'D', -2);
            graph.link('D', 'E', 0);
            graph.link('E', 'C', 0);
            graph.acyclic(edge => edge);
            $mol_assert_equal([...graph.sorted].join(''), 'CEDBA');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'parse and serial'() {
            $mol_assert_equal(new $mol_time_duration('P42.1Y').toString(), 'P42.1YT');
            $mol_assert_equal(new $mol_time_duration('P42.1M').toString(), 'P42.1MT');
            $mol_assert_equal(new $mol_time_duration('P42.1D').toString(), 'P42.1DT');
            $mol_assert_equal(new $mol_time_duration('PT42.1h').toString(), 'PT42.1H');
            $mol_assert_equal(new $mol_time_duration('PT42.1m').toString(), 'PT42.1M');
            $mol_assert_equal(new $mol_time_duration('PT42.1s').toString(), 'PT42.1S');
            $mol_assert_equal(new $mol_time_duration('P1Y2M3DT4h5m6.7s').toString(), 'P1Y2M3DT4H5M6.7S');
        },
        'negatives'() {
            $mol_assert_equal(new $mol_time_duration('P-1Y-2M-3DT-4h-5m-6.7s').toString(), new $mol_time_duration('-P1Y2M3DT4h5m6.7s').toString(), 'P-1Y-2M-3DT-4H-5M-6.7S');
            $mol_assert_equal(new $mol_time_duration('-P-1Y-2M-3DT-4h-5m-6.7s').toString(), 'P1Y2M3DT4H5M6.7S');
        },
        'format typed'() {
            $mol_assert_equal(new $mol_time_duration('P1Y2M3DT4h5m6s').toString('P#Y#M#DT#h#m#s'), 'P1Y2M3DT4H5M6S');
        },
        'format readable'() {
            $mol_assert_equal(new $mol_time_duration('P1Y2M3DT4h5m6s').toString('hh:mm:ss.sss'), '04:05:06.000');
        },
        'normalization'() {
            $mol_assert_equal(new $mol_time_duration('P1Y2M3DT44h55m66s').normal.toString(), 'P1Y2M4DT20H56M6S');
            $mol_assert_equal(new $mol_time_duration('P-1Y-2M-3DT-44h-55m-66s').normal.toString(), 'P-1Y-2M-4DT-20H-56M-6S');
        },
        'comparison'() {
            const iso = 'P1Y1M1DT1h1m1s';
            $mol_assert_equal(new $mol_time_duration(iso), new $mol_time_duration(iso));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'parse and serial'() {
            $mol_assert_equal(new $mol_time_moment('2014').toString(), '2014');
            $mol_assert_equal(new $mol_time_moment('2014-01').toString(), '2014-01');
            $mol_assert_equal(new $mol_time_moment('2014-01-02').toString(), '2014-01-02');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03').toString(), '2014-01-02T03');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04').toString(), '2014-01-02T03:04');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04:05').toString(), '2014-01-02T03:04:05');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04:05.006').toString(), '2014-01-02T03:04:05.006');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04:05.006Z').toString(), '2014-01-02T03:04:05.006+00:00');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04:05.006+07:00').toString(), '2014-01-02T03:04:05.006+07:00');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04:05+07:08').toString(), '2014-01-02T03:04:05+07:08');
            $mol_assert_equal(new $mol_time_moment('2014-01-02T03:04+07:08').toString(), '2014-01-02T03:04+07:08');
            $mol_assert_equal(new $mol_time_moment('T03:04+07:08').toString(), 'T03:04+07:08');
            $mol_assert_equal(new $mol_time_moment('T03:04:05').toString(), 'T03:04:05');
            $mol_assert_equal(new $mol_time_moment('T03:04').toString(), 'T03:04');
            $mol_assert_equal(new $mol_time_moment('T03').toString(), 'T03');
        },
        'format simple'() {
            $mol_assert_equal(new $mol_time_moment('2014-01-02T01:02:03.000000').toString('AD YY-M-D h:m:s'), '21 14-1-2 1:2:3');
        },
        'format padded'() {
            $mol_assert_equal(new $mol_time_moment('2014-01-02T01:02:03.000').toString('YYYY-MM-DD hh:mm:ss'), '2014-01-02 01:02:03');
        },
        'format time zone'() {
            $mol_assert_equal(new $mol_time_moment('2014-01-02T01:02:03+05:00').toString('Z'), '+05:00');
        },
        'format names'() {
            new $mol_time_moment('2014-01-02T01:02:03.000').toString('Month Mon | WeekDay WD');
        },
        'shifting'() {
            $mol_assert_equal(new $mol_time_moment('T15:54:58.243+03:00').shift({}).toString(), 'T15:54:58.243+03:00');
            $mol_assert_equal(new $mol_time_moment('2014-01-02').shift('P1Y').toString(), '2015-01-02');
            $mol_assert_equal(new $mol_time_moment('2014-01-02').shift('P12M').toString(), '2015-01-02');
            $mol_assert_equal(new $mol_time_moment('2014-01-02').shift('P365D').toString(), '2015-01-02');
            $mol_assert_equal(new $mol_time_moment('2014-01-02').shift('PT8760h').toString(), '2015-01-02');
            $mol_assert_equal(new $mol_time_moment('2014-01').shift('PT8760h').toString(), '2015-01');
            $mol_assert_equal(new $mol_time_moment('2014-01').shift('PT-8760h').toString(), '2013-01');
        },
        'native from reduced'() {
            $mol_assert_equal(new $mol_time_moment('T15:00').native.toISOString().slice(0, -5), new $mol_time_moment().merge('T15:00:00').toOffset('Z').toString().slice(0, -6));
        },
        'normalization'() {
            $mol_assert_equal(new $mol_time_moment({ year: 2015, month: 6, day: 34 }).normal.toString(), '2015-08-04');
            $mol_assert_equal(new $mol_time_moment('2024-09-30 19:00+03:00').normal.month, 8);
        },
        'renormalization'() {
            $mol_assert_equal(new $mol_time_moment('2024-08').normal.toString(), '2024-08');
            $mol_assert_equal(new $mol_time_moment('2024-11').normal.toString(), '2024-11');
        },
        'iso week day'() {
            $mol_assert_equal(new $mol_time_moment('2017-09-17').weekday, $mol_time_moment_weekdays.sunday);
            $mol_assert_equal(new $mol_time_moment('2017-09-18').weekday, $mol_time_moment_weekdays.monday);
        },
        'change offset'() {
            $mol_assert_equal(new $mol_time_moment('2021-04-10 +03:00').toOffset('Z').toString(), '2021-04-09T21:00:00+00:00');
        },
        'comparison'() {
            const iso = '2021-01-02T03:04:05.678+09:10';
            $mol_assert_equal(new $mol_time_moment(iso), new $mol_time_moment(iso));
        },
        'array keeps zero offset'() {
            const moment = new $mol_time_moment('2026-01-25T16:37:36.129+00:00');
            const restored = new $mol_time_moment(moment.toArray());
            $mol_assert_equal(restored.offset?.count('PT1m'), 0);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is number'() {
            $mol_data_number(0);
        },
        'Is not number'() {
            $mol_assert_fail(() => {
                $mol_data_number('x');
            }, 'x is not a number');
        },
        'Is object number'() {
            $mol_assert_fail(() => {
                $mol_data_number(new Number(''));
            }, '0 is not a number');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is integer'() {
            $mol_data_integer(0);
        },
        'Is float'() {
            $mol_assert_fail(() => {
                $mol_data_integer(1.1);
            }, '1.1 is not an integer');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'tagged typing'() {
            const { Weight, Length } = $mol_data_tagged({
                Weight: $mol_data_integer,
                Length: $mol_data_integer,
            });
            Length(20); // Validate
            let len = Length(10); // Inferred type
            len = 20; // Explicit type
            let num = len; // Implicit cast
            len = Length(Weight(20)); // Explicit cast
            // len = 20 // Compile time error
            // len = Weight( 20 ) // Compile time error
            // len = Length( 20.1 ) // Run time error
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'config by value'() {
            const N = $mol_data_setup((a) => a, 5);
            $mol_assert_equal(N.config, 5);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'function'() {
            $mol_assert_not($mol_func_is_class(function () { }));
        },
        'generator'() {
            $mol_assert_not($mol_func_is_class(function* () { }));
        },
        'async'() {
            $mol_assert_not($mol_func_is_class(async function () { }));
        },
        'arrow'() {
            $mol_assert_not($mol_func_is_class(() => null));
        },
        'named class'() {
            $mol_assert_ok($mol_func_is_class(class Foo {
            }));
        },
        'unnamed class'() {
            $mol_assert_ok($mol_func_is_class(class {
            }));
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $mol_test({
        // @todo enable on strict
        // 'no functions'() {
        // 	const stringify = $mol_data_pipe()
        // 	type Type = $mol_type_assert<
        // 		typeof stringify,
        // 		( input : never )=> never
        // 	>
        // },
        'single function'() {
            const stringify = $mol_data_pipe((input) => input.toString());
            $mol_assert_equal(stringify(5), '5');
        },
        'two functions'() {
            const isLong = $mol_data_pipe((input) => input.toString(), (input) => input.length > 2);
            $mol_assert_equal(isLong(5.0), false);
            $mol_assert_equal(isLong(5.1), true);
        },
        'three functions'() {
            const pattern = $mol_data_pipe((input) => input.toString(), (input) => new RegExp(input), (input) => input.toString());
            $mol_assert_equal(pattern(5), '/5/');
        },
        'classes'() {
            class Box {
                value;
                constructor(value) {
                    this.value = value;
                }
            }
            const boxify = $mol_data_pipe((input) => input.toString(), Box);
            $mol_assert_ok(boxify(5) instanceof Box);
            $mol_assert_like(boxify(5).value, '5');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Watch one value'($) {
            class App extends $mol_object2 {
                static $ = $;
                static dict = new $mol_wire_dict();
                static lucky() {
                    return this.dict.get(777);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "lucky", null);
            $mol_assert_equal(App.lucky(), undefined);
            App.dict.set(666, 6666);
            $mol_assert_equal(App.lucky(), undefined);
            App.dict.set(777, 7777);
            $mol_assert_equal(App.lucky(), 7777);
            App.dict.delete(777);
            $mol_assert_equal(App.lucky(), undefined);
        },
        'Watch item channel'($) {
            class App extends $mol_object2 {
                static $ = $;
                static dict = new $mol_wire_dict();
                static lucky() {
                    return this.dict.item(777);
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "lucky", null);
            $mol_assert_equal(App.lucky(), null);
            App.dict.item(666, 6666);
            $mol_assert_equal(App.lucky(), null);
            App.dict.item(777, 7777);
            $mol_assert_equal(App.lucky(), 7777);
            App.dict.item(777, null);
            $mol_assert_equal(App.lucky(), null);
        },
        'Watch size'($) {
            class App extends $mol_object2 {
                static $ = $;
                static dict = new $mol_wire_dict();
                static size() {
                    return this.dict.size;
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "size", null);
            $mol_assert_equal(App.size(), 0);
            App.dict.set(666, 6666);
            $mol_assert_equal(App.size(), 1);
            App.dict.set(777, 7777);
            $mol_assert_equal(App.size(), 2);
            App.dict.delete(777);
            $mol_assert_equal(App.size(), 1);
        },
        'Watch for-of'($) {
            class App extends $mol_object2 {
                static $ = $;
                static dict = new $mol_wire_dict();
                static sum() {
                    let keys = 0;
                    let vals = 0;
                    for (const [key, val] of this.dict) {
                        keys += key;
                        vals += val;
                    }
                    return [keys, vals];
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "sum", null);
            $mol_assert_like(App.sum(), [0, 0]);
            App.dict.set(111, 1111);
            $mol_assert_like(App.sum(), [111, 1111]);
            App.dict.set(222, 2222);
            $mol_assert_like(App.sum(), [333, 3333]);
            App.dict.delete(111);
            $mol_assert_like(App.sum(), [222, 2222]);
        },
        'Watch forEach'($) {
            class App extends $mol_object2 {
                static $ = $;
                static dict = new $mol_wire_dict();
                static sum() {
                    let keys = 0;
                    let vals = 0;
                    this.dict.forEach((val, key) => {
                        keys += key;
                        vals += val;
                    });
                    return [keys, vals];
                }
            }
            __decorate([
                $mol_wire_solo
            ], App, "sum", null);
            $mol_assert_like(App.sum(), [0, 0]);
            App.dict.set(111, 1111);
            $mol_assert_like(App.sum(), [111, 1111]);
            App.dict.set(222, 2222);
            $mol_assert_like(App.sum(), [333, 3333]);
            App.dict.delete(111);
            $mol_assert_like(App.sum(), [222, 2222]);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'triplets'() {
            $mol_assert_equal(new $mol_time_interval('2015-01-01/P1M').end.toString(), '2015-02-01');
            $mol_assert_equal(new $mol_time_interval('P1M/2015-02-01').start.toString(), '2015-01-01');
            $mol_assert_equal(new $mol_time_interval('2015-01-01/2015-02-01').duration.toString(), 'PT2678400S');
        },
        'comparison'() {
            const iso = '2021-01-02/2022-03-04';
            $mol_assert_like(new $mol_time_interval(iso), new $mol_time_interval(iso));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'span for same uri'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 4);
            const child = span.span(4, 5, 8);
            $mol_assert_equal(child.uri, 'test.ts');
            $mol_assert_equal(child.row, 4);
            $mol_assert_equal(child.col, 5);
            $mol_assert_equal(child.length, 8);
        },
        'span after of given position'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 4);
            const child = span.after(11);
            $mol_assert_equal(child.uri, 'test.ts');
            $mol_assert_equal(child.row, 1);
            $mol_assert_equal(child.col, 7);
            $mol_assert_equal(child.length, 11);
        },
        'slice span - regular'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 5);
            const child = span.slice(1, 4);
            $mol_assert_equal(child.row, 1);
            $mol_assert_equal(child.col, 4);
            $mol_assert_equal(child.length, 3);
            const child2 = span.slice(2, 2);
            $mol_assert_equal(child2.col, 5);
            $mol_assert_equal(child2.length, 0);
        },
        'slice span - negative'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 5);
            const child = span.slice(-3, -1);
            $mol_assert_equal(child.row, 1);
            $mol_assert_equal(child.col, 5);
            $mol_assert_equal(child.length, 2);
        },
        'slice span - out of range'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 5);
            $mol_assert_fail(() => span.slice(-1, 3), `End value '3' can't be less than begin value (test.ts#1:3/5)`);
            $mol_assert_fail(() => span.slice(1, 6), `End value '6' out of range (test.ts#1:3/5)`);
            $mol_assert_fail(() => span.slice(1, 10), `End value '10' out of range (test.ts#1:3/5)`);
        },
        'error handling'($) {
            const span = new $mol_span('test.ts', '', 1, 3, 4);
            const error = span.error('Some error');
            $mol_assert_equal(error.message, 'Some error (test.ts#1:3/4)');
        }
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'tree parsing'($) {
            $mol_assert_equal($.$mol_tree2_from_string("foo\nbar\n").kids.length, 2);
            $mol_assert_equal($.$mol_tree2_from_string("foo\nbar\n").kids[1].type, "bar");
            $mol_assert_equal($.$mol_tree2_from_string("foo\n\n\n").kids.length, 1);
            $mol_assert_equal($.$mol_tree2_from_string("=foo\n\\bar\n").kids.length, 2);
            $mol_assert_equal($.$mol_tree2_from_string("=foo\n\\bar\n").kids[1].value, "bar");
            $mol_assert_equal($.$mol_tree2_from_string("foo bar \\pol\n").kids[0].kids[0].kids[0].value, "pol");
            $mol_assert_equal($.$mol_tree2_from_string("foo bar\n\t\\pol\n\t\\men\n").kids[0].kids[0].kids[1].value, "men");
            $mol_assert_equal($.$mol_tree2_from_string('foo bar \\text\n').toString(), 'foo bar \\text\n');
        },
        'Too many tabs'($) {
            const tree = `
				foo
						bar
			`;
            $mol_assert_fail(() => {
                $.$mol_tree2_from_string(tree, 'test');
            }, 'Too many tabs\ntest#3:1/6\n!!!!!!\n\t\t\t\t\t\tbar');
        },
        'Too few tabs'($) {
            const tree = `
					foo
				bar
			`;
            $mol_assert_fail(() => {
                $.$mol_tree2_from_string(tree, 'test');
            }, 'Too few tabs\ntest#3:1/4\n!!!!\n\t\t\t\tbar');
        },
        'Wrong nodes separator at start'($) {
            const tree = `foo\n \tbar\n`;
            $mol_assert_fail(() => {
                $.$mol_tree2_from_string(tree, 'test');
            }, 'Wrong nodes separator\ntest#2:1/2\n!!\n \tbar');
        },
        'Wrong nodes separator in the middle'($) {
            const tree = `foo  bar\n`;
            $mol_assert_fail(() => {
                $.$mol_tree2_from_string(tree, 'test');
            }, 'Wrong nodes separator\ntest#1:5/1\n    !\nfoo  bar');
        },
        'Unexpected EOF, LF required'($) {
            const tree = `	foo`;
            $mol_assert_fail(() => {
                $.$mol_tree2_from_string(tree, 'test');
            }, 'Unexpected EOF, LF required\ntest#1:5/1\n	   !\n	foo');
        },
        'Errors skip and collect'($) {
            const tree = `foo  bar`;
            const errors = [];
            const $$ = $.$mol_ambient({
                $mol_fail: (error) => {
                    errors.push(error.message);
                    return null;
                }
            });
            const res = $$.$mol_tree2_from_string(tree, 'test');
            $mol_assert_like(errors, [
                'Wrong nodes separator\ntest#1:5/1\n    !\nfoo  bar',
                'Unexpected EOF, LF required\ntest#1:9/1\n        !\nfoo  bar',
            ]);
            $mol_assert_equal(res.toString(), 'foo bar\n');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function check(tree, ideal) {
        $mol_assert_equal(tree.toString(), $$.$mol_tree2_from_string(ideal).toString());
    }
    $mol_test({
        'inserting'($) {
            check($.$mol_tree2_from_string(`
					a b c d
				`).insert($mol_tree2.struct('x'), 'a', 'b', 'c'), `
					a b x
				`);
            check($.$mol_tree2_from_string(`
					a b
				`).insert($mol_tree2.struct('x'), 'a', 'b', 'c', 'd'), `
					a b c x
				`);
            check($.$mol_tree2_from_string(`
					a b c d
				`)
                .insert($mol_tree2.struct('x'), 0, 0, 0), `
					a b x
				`);
            check($.$mol_tree2_from_string(`
					a b
				`)
                .insert($mol_tree2.struct('x'), 0, 0, 0, 0), `
					a b \\
						x
				`);
            check($.$mol_tree2_from_string(`
					a b c d
				`)
                .insert($mol_tree2.struct('x'), null, null, null), `
					a b x
				`);
            check($.$mol_tree2_from_string(`
					a b
				`)
                .insert($mol_tree2.struct('x'), null, null, null, null), `
					a b \\
						x
				`);
        },
        'updating'($) {
            check($.$mol_tree2_from_string(`
					a b c d
				`).update([], 'a', 'b', 'c')[0], `
					a b
				`);
            check($.$mol_tree2_from_string(`
					a b c d
				`).update([$mol_tree2.struct('x')])[0], `
					x
				`);
            check($.$mol_tree2_from_string(`
					a b c d
				`).update([$mol_tree2.struct('x'), $mol_tree2.struct('y')], 'a', 'b', 'c')[0], `
					a b
						x
						y
				`);
        },
        'deleting'($) {
            const base = $.$mol_tree2_from_string(`
				a b c d
			`);
            check(base.insert(null, 'a', 'b', 'c'), `
					a b
				`);
            check(base.update(base.select('a', 'b', 'c', null).kids, 'a', 'b', 'c')[0], `
					a b d
				`);
            check(base.insert(null, 0, 0, 0), `
					a b
				`);
        },
        'hack'($) {
            const res = $.$mol_tree2_from_string(`
				foo bar xxx
			`)
                .hack({
                'bar': (input, belt) => [input.struct('777', input.hack(belt))],
            });
            $mol_assert_equal(res.map(String), ['foo 777 xxx\n']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "1 byte int"($) {
                $mol_assert_equal($mol_bigint_encode(0n), new Uint8Array(new Int8Array([0]).buffer));
                $mol_assert_equal($mol_bigint_encode(1n), new Uint8Array(new Int8Array([1]).buffer));
                $mol_assert_equal($mol_bigint_encode(-1n), new Uint8Array(new Int8Array([-1]).buffer));
                $mol_assert_equal($mol_bigint_encode(127n), new Uint8Array(new Int8Array([127]).buffer));
                $mol_assert_equal($mol_bigint_encode(-128n), new Uint8Array(new Int8Array([-128]).buffer));
            },
            "2 byte int"($) {
                $mol_assert_equal($mol_bigint_encode(128n), new Uint8Array(new Int16Array([128]).buffer));
                $mol_assert_equal($mol_bigint_encode(-129n), new Uint8Array(new Int16Array([-129]).buffer));
                $mol_assert_equal($mol_bigint_encode(128n * 256n - 1n), new Uint8Array(new Int16Array([128 * 256 - 1]).buffer));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n), new Uint8Array(new Int16Array([-128 * 256]).buffer));
            },
            "3 byte int"($) {
                $mol_assert_equal($mol_bigint_encode(128n * 256n), new Uint8Array(new Int32Array([128 * 256]).buffer).slice(0, 3));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n - 1n), new Uint8Array(new Int32Array([-128 * 256 - 1]).buffer).slice(0, 3));
                $mol_assert_equal($mol_bigint_encode(128n * 256n ** 2n - 1n), new Uint8Array(new Int32Array([128 * 256 ** 2 - 1]).buffer).slice(0, 3));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n ** 2n), new Uint8Array(new Int32Array([-128 * 256 ** 2]).buffer).slice(0, 3));
            },
            "4 byte int"($) {
                $mol_assert_equal($mol_bigint_encode(128n * 256n ** 2n), new Uint8Array(new Int32Array([128 * 256 ** 2]).buffer));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n ** 2n - 1n), new Uint8Array(new Int32Array([-128 * 256 ** 2 - 1]).buffer));
                $mol_assert_equal($mol_bigint_encode(128n * 256n ** 3n - 1n), new Uint8Array(new Int32Array([128 * 256 ** 3 - 1]).buffer));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n ** 3n), new Uint8Array(new Int32Array([-128 * 256 ** 3]).buffer));
            },
            "8 byte int"($) {
                $mol_assert_equal($mol_bigint_encode(128n * 256n ** 7n - 1n), new Uint8Array(new BigInt64Array([128n * 256n ** 7n - 1n]).buffer));
                $mol_assert_equal($mol_bigint_encode(-128n * 256n ** 7n), new Uint8Array(new BigInt64Array([-128n * 256n ** 7n]).buffer));
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        function check(text, bytes) {
            const ideal = new Uint8Array(bytes);
            const actual = $mol_charset_ucf_encode(text);
            $mol_assert_equal($mol_charset_ucf_decode(actual), text);
            $mol_assert_equal(actual, ideal);
        }
        $mol_test({
            "Full ASCII compatible"($) {
                check('hi', [0x68, 0x69]);
            },
            "1B ASCII with diacritic"($) {
                check('allo\u0300', [0x61, 0x6C, 0x6C, 0x6F, 0xE2]);
            },
            "1B Cyrillic"($) {
                check('мир', [0x88, 0x3C, 0xE2, 0x40, 0xF8]);
            },
            "1B Cyrillic with nummbers and punctuation"($) {
                check('м.1', [0x88, 0x3C, 0x2E, 0x31, 0xF8]);
            },
            "2B Kanji"($) {
                check('美', [0xF9, 0x0E, 0x63, 0x87]);
            },
            "3B rare Kanji"($) {
                check('𲎯', [0xF7, 0x2F, 0x47, 0x0C, 0x89]);
            },
            "1B Kana"($) {
                check('しい', [0xE0, 0x57, 0x44, 0xA0]);
            },
            "2B Emoji"($) {
                check('🏴', [0xFF, 0x74, 0x4B, 0x81]);
            },
            "2B Emoji with 1B modifiers"($) {
                check('🏴‍☠', [0xFF, 0x74, 0x4B, 0xC1, 0x0D, 0x8C, 0xA9, 0xB4]);
            },
            "2B Emoji with 3B Tag"($) {
                check('🏴\u{E007F}', [0xFF, 0x74, 0x4B, 0xF8, 0x7F, 0x00, 0xF3, 0x89]);
            },
            "Mixed scripts"($) {
                check('allô 美しい мир, 🏴‍☠\n', [
                    0x61, 0x6C, 0x6C, 0x6F, 0xEA, 0x20, // allô 
                    0xF9, 0x0E, 0x63, 0xE7, 0x57, 0x44, 0x20, // 美しい 
                    0xA8, 0x3C, 0xE2, 0x40, 0x2C, 0x20, // мир, 
                    0xF7, 0x74, 0x4B, 0xC1, 0x0D, 0x8C, 0xA9, 0x0A, // 🏴‍☠\n
                    0xB4,
                ]);
            },
            "Wrong ending"($) {
                const bin = new Uint8Array([0x88, 0x3C, 0xE2, 0x40]);
                const error = $mol_assert_fail(() => $mol_charset_ucf_decode(bin), 'Wrong ending');
                $mol_assert_equal(error.cause.mode, 166);
                $mol_assert_equal(error.cause.text, 'мир');
            },
            "Wrong byte"($) {
                const bin = new Uint8Array([0xFF, 0x74, 0x4B, 0x74, 0x9B, 0x81]);
                const error = $mol_assert_fail(() => $mol_charset_ucf_decode(bin), 'Wrong byte');
                $mol_assert_equal(error.cause.pos, 4);
                $mol_assert_equal(error.cause.text, '🏴');
            },
            "Wrong 2B sequence length"($) {
                const bin = new Uint8Array([0x78, 0xF9, 0x0E]);
                const error = $mol_assert_fail(() => $mol_charset_ucf_decode(bin), 'Expected 2 bytes');
                $mol_assert_equal(error.cause.pos, 2);
                $mol_assert_equal(error.cause.text, 'x');
            },
            "Wrong 3B sequence length"($) {
                const bin = new Uint8Array([0x78, 0xF7, 0x2F, 0x47]);
                const error = $mol_assert_fail(() => $mol_charset_ucf_decode(bin), 'Expected 3 bytes');
                $mol_assert_equal(error.cause.pos, 2);
                $mol_assert_equal(error.cause.text, 'x');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "1 byte int"($) {
                $mol_assert_equal($mol_bigint_decode(new Uint8Array), 0n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int8Array([1]).buffer)), 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int8Array([-1]).buffer)), -1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int8Array([127]).buffer)), 127n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int8Array([-128]).buffer)), -128n);
            },
            "2 byte int"($) {
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int16Array([128]).buffer)), 128n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int16Array([-129]).buffer)), -129n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int16Array([128 * 256 - 1]).buffer)), 128n * 256n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int16Array([-128 * 256]).buffer)), -128n * 256n);
            },
            "3 byte int"($) {
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([128 * 256]).buffer).slice(0, 3)), 128n * 256n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([-128 * 256 - 1]).buffer).slice(0, 3)), -128n * 256n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([128 * 256 ** 2 - 1]).buffer).slice(0, 3)), 128n * 256n ** 2n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([-128 * 256 ** 2]).buffer).slice(0, 3)), -128n * 256n ** 2n);
            },
            "4 byte int"($) {
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([128 * 256 ** 2]).buffer)), 128n * 256n ** 2n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([-128 * 256 ** 2 - 1]).buffer)), -128n * 256n ** 2n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([128 * 256 ** 3 - 1]).buffer)), 128n * 256n ** 3n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new Int32Array([-128 * 256 ** 3]).buffer)), -128n * 256n ** 3n);
            },
            "8 byte int"($) {
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new BigInt64Array([128n * 256n ** 7n - 1n]).buffer)), 128n * 256n ** 7n - 1n);
                $mol_assert_equal($mol_bigint_decode(new Uint8Array(new BigInt64Array([-128n * 256n ** 7n]).buffer)), -128n * 256n ** 7n);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Zero int"($) {
                $mol_assert_equal($mol_bigint_decode($mol_bigint_encode(0n)), 0n);
            },
            "Large positive int"($) {
                $mol_assert_equal($mol_bigint_decode($mol_bigint_encode(12345678901234567890n)), 12345678901234567890n);
            },
            "Large negative int"($) {
                $mol_assert_equal($mol_bigint_decode($mol_bigint_encode(-12345678901234567890n)), -12345678901234567890n);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        const { uint, link, spec, blob, text, list, tupl, sint } = $mol_vary_tip;
        const { none, both, fp16, fp32, fp64 } = $mol_vary_spec;
        const { L1, L2, L4, L8, LA } = $mol_vary_len;
        const str = $mol_charset_ucf_encode;
        function check(vary, ideal, Vary = $mol_vary) {
            const pack = Vary.pack(vary);
            $mol_assert_equal(Vary.take(pack), vary);
            $mol_assert_equal(pack, new Uint8Array(ideal));
        }
        $mol_test({
            "vary pack logical"($) {
                check([null], [spec | none]);
                check([true], [$mol_vary_spec.true]);
                check([false], [$mol_vary_spec.fake]);
                check([undefined], [spec | both]);
            },
            "vary pack uint0"($) {
                check([0], [0]);
                check([27], [27]);
            },
            "vary pack uint1"($) {
                check([28], [uint | L1, 28]);
                check([255], [uint | L1, 255]);
            },
            "vary pack uint2"($) {
                check([256], [uint | L2, 0, 1]);
                check([256 ** 2 - 1], [uint | L2, 255, 255]);
            },
            "vary pack uint4"($) {
                check([256 ** 2], [uint | L4, 0, 0, 1, 0]);
                check([256 ** 4 - 1], [uint | L4, 255, 255, 255, 255]);
            },
            "vary pack uint8"($) {
                check([256 ** 4], [uint | L8, 0, 0, 0, 0, 1, 0, 0, 0]);
                check([Number.MAX_SAFE_INTEGER], [uint | L8, 255, 255, 255, 255, 255, 255, 31, 0]);
                check([256n ** 8n - 1n], [uint | L8, 255, 255, 255, 255, 255, 255, 255, 255]);
            },
            "vary pack sint0"($) {
                check([-1], [-1]);
                check([-27], [-27]);
            },
            "vary pack sint1"($) {
                check([-28,], [sint | -L1, -28]);
                check([-256 / 2], [sint | -L1, 128]);
            },
            "vary pack sint2"($) {
                check([-256 / 2 - 1], [sint | -L2, 127, 255]);
                check([-(256 ** 2) / 2], [sint | -L2, 0, 128]);
            },
            "vary pack sint4"($) {
                check([-(256 ** 2) / 2 - 1], [sint | -L4, 255, 127, 255, 255]);
                check([-(256 ** 4) / 2], [sint | -L4, 0, 0, 0, 128]);
            },
            "vary pack sint8"($) {
                check([-(256 ** 4) / 2 - 1], [sint | -L8, 255, 255, 255, 127, 255, 255, 255, 255]);
                check([Number.MIN_SAFE_INTEGER], [sint | -L8, 1, 0, 0, 0, 0, 0, 224, 255]);
                check([-(2n ** 63n)], [sint | -L8, 0, 0, 0, 0, 0, 0, 0, 128]);
            },
            "vary pack bigint"($) {
                check([2n ** 64n], [sint | -LA, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
                check([2n ** 2111n], [sint | -LA, 0, 1, ...Array.from({ length: 263 }, () => 0), 128, 0]);
                check([-1n - 2n ** 64n], [sint | -LA, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 254]);
                check([-1n - 2n ** 2111n], [sint | -LA, 0, 1, ...Array.from({ length: 263 }, () => 255), -129, 255]);
            },
            "vary pack float"($) {
                check([1.5], [fp64, ...new Uint8Array(new Float64Array([1.5]).buffer)]);
            },
            "vary pack list"($) {
                check([[1, 2, 3]], [list | 3, 1, 2, 3]);
                check([[[], [1], [2, 3]]], [list | 3, list | 0, list | 1, 1, list | 2, 2, 3]);
            },
            "vary pack dedup list"($) {
                const pair = [1, 2];
                check([[pair, pair]], [list | 2, list | 2, 1, 2, link | 0]);
                const seven = [7];
                const box = [seven];
                check([[box, box, seven]], [list | 3, list | 1, list | 1, 7, link | 1, link | 0]);
            },
            "vary pack cyclic list"($) {
                const foo = [];
                foo.push([foo]);
                $mol_assert_fail(() => $mol_vary.pack([foo]), 'Cyclic refs');
            },
            "vary pack dedup uint"($) {
                check([[28, 28]], [list | 2, uint | L1, 28, link | 0]);
                check([[2n ** 64n, 2n ** 64n]], [list | 2, sint | -LA, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, link | 0]);
            },
            "vary pack dedup float"($) {
                check([[1.5, 1.5]], [list | 2, fp64, ...new Uint8Array(new Float64Array([1.5]).buffer), link | 0]);
            },
            "vary pack text"($) {
                check(['foo'], [text | 3, ...str('foo')]);
                check(['абв'], [text | 5, ...str('абв')]);
                const long_lat = 'abcdefghijklmnopqrst';
                check([long_lat], [text | L1, 20, ...str(long_lat)]);
                const long_cyr = 'абвгдеёжзийклмнопрст';
                check([long_cyr], [text | L1, 22, ...str(long_cyr)]);
            },
            "vary pack dedup text"($) {
                check([["f", "f"]], [list | 2, text | 1, ...str('f'), link | 0]);
            },
            "vary pack blob"($) {
                check([new Uint8Array([1, 255])], [blob | 2, uint | L1, 1, 255]);
                check([new Int8Array([-128, 127])], [blob | 2, sint | ~L1, -128, 127]);
                check([new Uint32Array([255])], [blob | 4, uint | L4, 255, 0, 0, 0]);
                check([new Int32Array([-128])], [blob | 4, sint | ~L4, -128, 255, 255, 255]);
                check([new BigUint64Array([255n])], [blob | 8, uint | L8, 255, 0, 0, 0, 0, 0, 0, 0]);
                check([new BigInt64Array([-128n])], [blob | 8, sint | ~L8, -128, 255, 255, 255, 255, 255, 255, 255]);
                check([new Float32Array([1.5])], [blob | 4, fp32, ...new Uint8Array(new Float32Array([1.5]).buffer)]);
                check([new Float64Array([1.5])], [blob | 8, fp64, ...new Uint8Array(new Float64Array([1.5]).buffer)]);
            },
            "vary pack dedup blob"($) {
                const part = new Uint8Array([1, 2]);
                check([[part, part]], [list | 2, blob | 2, uint | L1, 1, 2, link | 0]);
            },
            "vary pack struct"($) {
                check([{ x: 1, y: 2 }], [tupl | 2, list | 2, text | 1, ...str('x'), text | 1, ...str('y'), 1, 2]);
                check([{ x: {}, y: { a: 1 } }], [tupl | 2, list | 2, text | 1, ...str('x'), text | 1, ...str('y'), tupl | 0, list | 0, tupl | 1, list | 1, text | 1, ...str('a'), 1]);
            },
            "vary pack struct shape dedup"($) {
                check([[{}, { foo: 1 }, { foo: 2 }]], [list | 3, tupl | 0, list | 0, tupl | 1, list | 1, text | 3, ...str('foo'), 1, tupl | 1, link | 3, 2]);
                check([{ x: 1, y: { x: 2, y: 3 } }], [tupl | 2, list | 2, text | 1, ...str('x'), text | 1, ...str('y'), 1, tupl | 2, link | 2, 2, 3]);
            },
            "vary pack struct full dedup"($) {
                const item = { x: 1 };
                check([[item, item]], [list | 2, tupl | 1, list | 1, text | 1, ...str('x'), 1, link | 2]);
                const part = { x: 1, y: 2 };
                check([{ x: part, y: part }], [tupl | 2, list | 2, text | 1, ...str('x'), text | 1, ...str('y'), tupl | 2, link | 2, 1, 2, link | 3]);
            },
            "vary pack cyclic struct"($) {
                const foo = { bar: null };
                foo.bar = foo;
                $mol_assert_fail(() => $mol_vary.pack([foo]), 'Cyclic refs');
            },
            "vary pack Map"($) {
                check([new Map([['foo', 1], [2, 'bar']])], [tupl | 2, list | 2, text | 4, ...str('keys'), text | 4, ...str('vals'), list | 2, text | 3, ...str('foo'), 2, list | 2, 1, text | 3, ...str('bar')]);
            },
            "vary pack Set"($) {
                check([new Set([7, 'foo'])], [tupl | 1, list | 1, text | 3, ...str('set'), list | 2, 7, text | 3, ...str('foo')]);
            },
            "vary pack Date"($) {
                const date1 = new Date('2025-01-02T03:04:05');
                check([date1], [tupl | 1, list | 1, text | $mol_vary_len.L1, 9, ...str('unix_time'), uint | L4, ...new Uint8Array(new Uint32Array([date1.valueOf() / 1000]).buffer)]);
                const date2 = new Date('2025-01-02T03:04:05.678');
                check([date2], [tupl | 1, list | 1, text | $mol_vary_len.L1, 9, ...str('unix_time'), fp64, ...new Uint8Array(new Float64Array([date2.valueOf() / 1000]).buffer)]);
            },
            "vary pack DOM Element"($) {
                $mol_assert_equal($mol_dom_serialize($mol_jsx("div", null,
                    $mol_jsx("span", null),
                    $mol_jsx("br", null),
                    " ")), $mol_dom_serialize($mol_vary.take($mol_vary.pack([$mol_jsx("div", null,
                        $mol_jsx("span", null),
                        $mol_jsx("br", null),
                        " ")]))[0]));
            },
            "vary pack custom types in rooms"($) {
                class Foo {
                    a;
                    b;
                    constructor(a, b) {
                        this.a = a;
                        this.b = b;
                    }
                    ;
                    [Symbol.iterator]() {
                        return [this.a, this.b].values();
                    }
                }
                const Vary = $mol_vary.zone();
                Vary.type({
                    type: Foo,
                    keys: ['summ', 'diff'],
                    lean: foo => [foo.a + foo.b, foo.a - foo.b],
                    rich: ([summ, diff]) => new Foo((summ + diff) / 2, (summ - diff) / 2),
                });
                // restore
                check([new Foo(4, 2)], [tupl | 2, list | 2, text | 4, ...str('summ'), text | 4, ...str('diff'), 6, 2], Vary);
                // isolated
                $mol_assert_equal($mol_vary.take($mol_vary.pack([new Foo(4, 2)])), [{ a: 4, b: 2 }]);
                // inherited
                $mol_assert_equal(Vary.take(Vary.pack([new Map([[1, 2]])])), [new Map([[1, 2]])]);
            },
            "vary pack sequences"($) {
                check([], []);
                check([7], [7]);
                check([3, 4], [3, 4]);
                check([['foo', 'foo'], ['bar', 'bar']], [list | 2, text | 3, ...str('foo'), link | 0, list | 2, text | 3, ...str('bar'), link | 0]);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        function check(vary) {
            $mol_assert_equal(vary, $giper_baza_vary.take($giper_baza_vary.pack([vary]))[0]);
        }
        $mol_test({
            "Bin"($) {
                check(null);
                check(new Uint8Array([1, 2, 3]));
            },
            "Bool"($) {
                check(false);
                check(true);
            },
            "Int"($) {
                check(0);
                check(4611686018427387904n);
            },
            "Real"($) {
                check(0);
                check(Math.PI);
                check(Number.NaN);
                check(Number.POSITIVE_INFINITY);
                check(Number.NEGATIVE_INFINITY);
                check(Number.MAX_SAFE_INTEGER);
                check(Number.MIN_SAFE_INTEGER);
                check(BigInt(Number.MAX_VALUE));
                check(Number.MIN_VALUE);
            },
            "Link"($) {
                check(new $giper_baza_link(''));
                check($giper_baza_link.from_int(123456789));
            },
            "Str"($) {
                check('');
                check('123');
                check('🐱‍👤');
            },
            "Time"($) {
                check(new $mol_time_moment('1984-08-04T09:05:13.666+03:00'));
                check(new $mol_time_moment);
            },
            "Dura"($) {
                check(new $mol_time_duration('P1Y2M3DT4h5m6.6s'));
            },
            "Span"($) {
                check(new $mol_time_interval('T09:00/PT9h'));
            },
            "JSON"($) {
                check({ foo: ['bar'] });
                check([{ foo: 'bar' }]);
            },
            "DOM"($) {
                const xml = ($mol_jsx("div", null,
                    $mol_jsx("span", { class: "bar" }, "xxx")));
                $mol_assert_equal($mol_dom_serialize($giper_baza_vary.take($giper_baza_vary.pack([xml]))[0]), $mol_dom_serialize(xml));
            },
            "Tree"($) {
                const tree = $.$mol_tree2_from_string(`
				foo \\bar
					foo \\bar
			`);
                $mol_assert_equal($.$mol_tree2_to_string($giper_baza_vary.take($giper_baza_vary.pack([tree]))[0]), $.$mol_tree2_to_string(tree));
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $mol_bus extends $.$mol_bus {
            send() { }
        }
        $.$mol_bus = $mol_bus;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'empty array'() {
            $mol_assert_equal($mol_array_chunks([], () => true), []);
        },
        'one chunk'() {
            $mol_assert_equal($mol_array_chunks([1, 2, 3, 4, 5], () => false), [[1, 2, 3, 4, 5]]);
        },
        'fixed size chunk'() {
            $mol_assert_equal($mol_array_chunks([1, 2, 3, 4, 5], 3), [[1, 2, 3], [4, 5]]);
        },
        'first empty chunk'() {
            $mol_assert_equal($mol_array_chunks([1, 2, 3, 4, 5], (_, i) => i === 0), [[1, 2, 3, 4, 5]]);
        },
        'chunk for every item'() {
            $mol_assert_equal($mol_array_chunks([1, 2, 3, 4, 5], () => true), [[1], [2], [3], [4], [5]]);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $giper_baza_land_mock extends $.$giper_baza_land {
            sync() {
                return this;
            }
        }
        $.$giper_baza_land = $giper_baza_land_mock;
    });
    $mol_test({
        async 'Give rights'($) {
            const auth0 = await $.$giper_baza_auth.grab();
            const auth1 = await $.$giper_baza_auth.grab();
            const auth2 = await $.$giper_baza_auth.grab();
            const land0 = $giper_baza_land.make({ $, auth: () => auth0 });
            const land1 = $giper_baza_land.make({ $, link: () => land0.link(), auth: () => auth1 });
            $mol_assert_equal(land0.lord_rank(land0.link()), $giper_baza_rank_rule);
            $mol_assert_equal(land0.lord_rank(auth1.pass().lord()), $giper_baza_rank_read);
            land1.give(auth2.pass(), $giper_baza_rank_post('just'));
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_read);
            land0.give(auth1.pass(), $giper_baza_rank_read);
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_read);
            land0.give(auth1.pass(), $giper_baza_rank_read);
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_read);
            land0.give(auth1.pass(), $giper_baza_rank_post('just'));
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_post('just'));
            land0.give(auth1.pass(), $giper_baza_rank_pull('just'));
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_pull('just'));
            land0.give(auth1.pass(), $giper_baza_rank_rule);
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_rule);
            land0.give(auth1.pass(), $giper_baza_rank_post('just'));
            $mol_assert_equal(land0.pass_rank(auth1.pass()), $giper_baza_rank_post('just'));
            await $mol_wire_async(land1).units_steal(land0);
            $mol_assert_equal(land1.pass_rank(auth1.pass()), $giper_baza_rank_post('just'));
            land1.give(auth2.pass(), $giper_baza_rank_post('just'));
        },
        async 'Post Data and pick Delta'($) {
            const auth1 = $.$giper_baza_auth.grab();
            const auth2 = $.$giper_baza_auth.grab();
            const land1 = $giper_baza_land.make({ $, auth: () => auth1 });
            const land2 = $giper_baza_land.make({ $, link: () => land1.link(), auth: () => auth2 });
            $mol_assert_equal(await $mol_wire_async(land1).diff_units(), []);
            land1.post($giper_baza_link.hole, $giper_baza_link.hole, new $giper_baza_link('AA111111'), new Uint8Array([1]));
            $mol_assert_equal((await $mol_wire_async(land1).diff_units()).length, 4);
            const face = land1.faces.clone();
            land1.post(new $giper_baza_link('AA111111'), $giper_baza_link.hole, new $giper_baza_link('AA222222'), new Uint8Array([2]));
            $mol_assert_equal((await $mol_wire_async(land1).diff_units()).length, 5);
            $mol_assert_equal((await $mol_wire_async(land1).diff_units(face)).length, 2);
            await $mol_wire_async(land2).units_steal(land1);
            land2.post(new $giper_baza_link('AA222222'), $giper_baza_link.hole, new $giper_baza_link('AA333333'), new Uint8Array([3]));
            $mol_assert_equal((await $mol_wire_async(land2).diff_units()).length, 5);
            $mol_assert_equal((await $mol_wire_async(land2).diff_units(face)).length, 2);
            land1.give(auth2.pass(), $giper_baza_rank_post('just'));
            await $mol_wire_async(land2).units_steal(land1);
            land2.post(new $giper_baza_link('AA222222'), $giper_baza_link.hole, new $giper_baza_link('AA333333'), new Uint8Array([5]));
            $mol_assert_equal((await $mol_wire_async(land2).diff_units()).length, 9);
            $mol_assert_equal((await $mol_wire_async(land2).diff_units(face)).length, 6);
            land1.give(auth2.pass(), $giper_baza_rank_read);
            await $mol_wire_async(land2).units_steal(land1);
            $mol_assert_equal((await $mol_wire_async(land2).diff_units()).length, 7);
        },
        async 'Land encryption'($) {
            const land = $mol_wire_async($giper_baza_land.make({ $ }));
            $mol_assert_equal(await land.encrypted(), false);
            await land.encrypted(true);
            $mol_assert_equal(await land.encrypted(), true);
            const material = await land.post($giper_baza_link.hole, $giper_baza_link.hole, null, new Uint8Array([1, 2, 3]));
            $mol_assert_equal((await land.sand_encode(material)).data().length, 16);
            $mol_assert_equal(await land.sand_decode(material), new Uint8Array([1, 2, 3]));
            $mol_assert_equal((await land.sand_ordered({ head: $giper_baza_link.hole, peer: $giper_baza_link.hole })).length, 1);
            const tombstone = await land.post($giper_baza_link.hole, $giper_baza_link.hole, material.self(), null);
            $mol_assert_equal((await land.sand_encode(tombstone)).data().length, 1);
            $mol_assert_equal(await land.sand_decode(tombstone), null);
            $mol_assert_equal((await land.sand_ordered({ head: $giper_baza_link.hole, peer: $giper_baza_link.hole })).length, 1);
        },
        'Land fork & merge': $mol_wire_async(($) => {
            const home = $.$giper_baza_glob.home().land();
            const left = home.fork();
            home.Data($giper_baza_list).items_vary(['foo', 'xxx']);
            $mol_assert_equal(home.Data($giper_baza_list).items_vary(), ['foo', 'xxx']);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), ['foo', 'xxx']);
            left.faces.sync(home.faces);
            left.Data($giper_baza_list).items_vary(['foo', 'yyy']);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), ['foo', 'yyy']);
            const right = home.fork();
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary(['foo', 'zzz']);
            $mol_assert_equal(right.Data($giper_baza_list).items_vary(), ['foo', 'zzz']);
            const both = home.fork();
            $mol_assert_equal(both.Data($giper_baza_list).items_vary(), ['foo', 'xxx']);
            both.Tine().items_vary([right.link()]);
            $mol_assert_equal(both.Data($giper_baza_list).items_vary(), ['foo', 'zzz']);
            both.Tine().items_vary([left.link()]);
            $mol_assert_equal(both.Data($giper_baza_list).items_vary(), ['foo', 'yyy']);
            both.Tine().items_vary([right.link(), left.link()]);
            $mol_assert_equal(both.Data($giper_baza_list).items_vary(), ['foo', 'yyy']);
            both.Tine().items_vary([left.link(), right.link()]);
            $mol_assert_equal(both.Data($giper_baza_list).items_vary(), ['foo', 'zzz']);
        }),
        'Inner Links are relative to forked Land': $mol_wire_async(($) => {
            const Alice = $.$giper_baza_glob.home().land();
            const Bella = Alice.fork();
            const alice_val = Alice.Pawn($giper_baza_atom_text).Head(new $giper_baza_link('qwertyui'));
            const bella_val = Bella.Pawn($giper_baza_atom_text).Head(new $giper_baza_link('qwertyui'));
            alice_val.val('Alice');
            bella_val.val('Bella');
            const alice_link = Alice.Pawn($giper_baza_atom_link).Head(new $giper_baza_link('asdfghjk'));
            const bella_link = Bella.Pawn($giper_baza_atom_link).Head(new $giper_baza_link('asdfghjk'));
            alice_link.val(alice_val.link());
            $mol_assert_equal(alice_link.val(), alice_val.link());
            $mol_assert_unique(alice_link.val(), bella_link.val());
            $mol_assert_equal(bella_link.val(), bella_val.link());
        }),
        async 'Land Area inherits rights'($) {
            const area = await $mol_wire_async(() => {
                const base = $.$giper_baza_glob.land_grab([[null, $giper_baza_rank_post('just')]]);
                base.units_saving();
                return base.area_make();
            })();
            $mol_assert_equal(area.pass_rank(area.auth().pass()), $giper_baza_rank_rule);
            $mol_assert_equal(area.lord_rank($giper_baza_link.hole), $giper_baza_rank_post('just'));
        },
        async 'Gift to new Mate reaches Peer which knows Lord'($) {
            const auth0 = $.$giper_baza_auth.grab();
            const auth1 = $.$giper_baza_auth.grab();
            const auth2 = $.$giper_baza_auth.grab();
            const land0 = $giper_baza_land.make({ $, auth: () => auth0 });
            const land1 = $giper_baza_land.make({ $, link: () => land0.link(), auth: () => auth1 });
            land0.post($giper_baza_link.hole, $giper_baza_link.hole, new $giper_baza_link('AA111111'), new Uint8Array([1]));
            await $mol_wire_async(land1).units_steal(land0);
            const face = land1.faces.clone();
            land0.give(auth2.pass(), $giper_baza_rank_post('just'));
            const delta = await $mol_wire_async(land0).diff_units(face);
            await $mol_wire_async(land1).diff_apply(delta);
            $mol_assert_equal(land1.lord_rank(auth2.pass().lord()), $giper_baza_rank_post('just'));
        },
        // async 'Merge text changes'() {
        // 	const base = new $giper_baza_land( 1n, 1 )
        // 	base.chief.as( $hyoo_crowd_text ).str( 'Hello World and fun!' )
        // 	const left = base.fork( await $hyoo_crowd_peer.generate() )
        // 	const right = base.fork( await $hyoo_crowd_peer.generate() )
        // 	right.clock_data.tick( right.peer().id )
        // 	left.chief.as( $hyoo_crowd_text ).str( 'Hello Alice and fun!' )
        // 	right.chief.as( $hyoo_crowd_text ).str( 'Bye World and fun!' )
        // 	const left_delta = left.delta()
        // 	const right_delta = right.delta()
        // 	left.apply( right_delta )
        // 	right.apply( left_delta )
        // 	$mol_assert_equal(
        // 		left.chief.as( $hyoo_crowd_text ).str(),
        // 		right.chief.as( $hyoo_crowd_text ).str(),
        // 		'Bye Alice and fun!',
        // 	)
        // },
        // async 'Write into token'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'foobar' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'xyz', 3 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'fooxyzbar' ] )
        // },
        // async 'Write into token with split'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'foobar' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'XYZ', 2, 4 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'fo', 'XYZar' ] )
        // },
        // async 'Write over few tokens'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'xxx foo bar yyy' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'X Y Z', 6, 9 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'xxx', ' fo', 'X', ' Y', ' Zar', ' yyy' ] )
        // },
        // async 'Write whole token'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'xxxFoo yyy' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'bar', 3, 7 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'xxxbaryyy' ] )
        // },
        // async 'Write whole text'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'foo bar' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'xxx', 0, 7 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'xxx' ] )
        // },
        // async 'Write at the end'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'foo' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'bar' )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'foobar' ] )
        // },
        // async 'Write between tokens'() {
        // 	const store = new $giper_baza_land( 1n, 1 )
        // 	store.chief.as( $hyoo_crowd_text ).str( 'foo bar' )
        // 	store.chief.as( $hyoo_crowd_text ).write( 'xxx', 4 )
        // 	$mol_assert_equal( store.chief.as( $hyoo_crowd_list ).list(), [ 'foo', ' xxxbar' ] )
        // },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'gift unit type'() {
            const gift = $giper_baza_unit_gift.make();
            gift.rank($giper_baza_rank_rule);
            $mol_assert_equal(gift.kind(), 'gift');
            $mol_assert_equal(gift.rank(), $giper_baza_rank_rule);
        },
        'data unit type'() {
            const unit = $giper_baza_unit_sand.make(2);
            unit.ball(new Uint8Array([0xFF, 0xFF]));
            $mol_assert_equal(unit.kind(), 'sand');
            $mol_assert_equal(unit.size(), 2);
            $mol_assert_equal(unit.ball(), new Uint8Array([0xFF, 0xFF]));
        },
        'big data unit type'() {
            const unit = $giper_baza_unit_sand.make(1000);
            unit.ball(new Uint8Array(1000));
            $mol_assert_equal(unit.kind(), 'sand');
            $mol_assert_equal(unit.size(), 1000);
            $mol_assert_equal(unit.ball(), new Uint8Array(1000));
        },
        'gift unit fields'() {
            const unit = $giper_baza_unit_gift.make();
            $mol_assert_equal(unit.time(), 0);
            $mol_assert_equal(unit.mate(), $giper_baza_link.hole);
            unit.time_tick(0xd1d2d3d4d5d6);
            unit.mate(new $giper_baza_link('ÆPv6æfj3_9vX08ÆLx'));
            $mol_assert_equal(unit.time_tick(), 0xd1d2d3d4d5d6);
            $mol_assert_equal(unit.mate(), new $giper_baza_link('ÆPv6æfj3_9vX08ÆLx'));
        },
        'data unit fields'() {
            const unit = $giper_baza_unit_sand.make(0);
            $mol_assert_equal(unit.time(), 0);
            $mol_assert_equal(unit.head(), $giper_baza_link.hole);
            $mol_assert_equal(unit.self(), $giper_baza_link.hole);
            $mol_assert_equal(unit.lead(), $giper_baza_link.hole);
            unit.time_tick(0xd1d2d3d4d5d6);
            unit.head(new $giper_baza_link('ÆPv6æfj3'));
            unit.self(new $giper_baza_link('Pv6æfj39'));
            unit.lead(new $giper_baza_link('v6æfj39v'));
            $mol_assert_equal(unit.time_tick(), 0xd1d2d3d4d5d6);
            $mol_assert_equal(unit.head(), new $giper_baza_link('ÆPv6æfj3'));
            $mol_assert_equal(unit.self(), new $giper_baza_link('Pv6æfj39'));
            $mol_assert_equal(unit.lead(), new $giper_baza_link('v6æfj39v'));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Empty release"($) {
                const pool = new $mol_memory_pool;
                $mol_assert_equal(pool.empty(), true);
                pool.release(0, 0);
                $mol_assert_equal(pool.acquire(8), 0);
                $mol_assert_equal(pool.empty(), false);
                pool.release(0, 8);
                $mol_assert_equal(pool.empty(), true);
            },
            "linear allocation"($) {
                const pool = new $mol_memory_pool;
                $mol_assert_equal(pool.acquire(8), 0);
                $mol_assert_equal(pool.acquire(16), 8);
                $mol_assert_equal(pool.acquire(32), 24);
            },
            "allocation in released"($) {
                const pool = new $mol_memory_pool;
                $mol_assert_equal(pool.acquire(8), 0);
                $mol_assert_equal(pool.acquire(16), 8);
                pool.release(0, 16);
                $mol_assert_equal(pool.acquire(8), 0);
                $mol_assert_equal(pool.acquire(16), 24);
                $mol_assert_equal(pool.acquire(8), 8);
            },
            "space limitation"($) {
                const pool = new $mol_memory_pool(10);
                pool.acquire(8);
                pool.release(2, 4);
                $mol_assert_fail(() => pool.acquire(6), 'No free space\nneed: 6\nhave: 4');
            },
            "double release"($) {
                const pool = new $mol_memory_pool;
                $mol_assert_fail(() => pool.release(0, 2), 'Double release');
                $mol_assert_fail(() => pool.release(2, 2), 'Release out of allocated');
                pool.acquire(16);
                pool.release(4, 8);
                $mol_assert_fail(() => pool.release(4, 8), 'Double release');
                $mol_assert_fail(() => pool.release(10, 4), 'Double release');
                $mol_assert_fail(() => pool.release(2, 4), 'Double release');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
/** @jsxFrag $mol_jsx_frag */
var $;
(function ($) {
    $mol_test({
        'same list'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "b"),
                $mol_jsx("p", { "data-rev": "old" }, "c"));
            $mol_reconcile({
                prev: [...list.children],
                from: 0,
                to: 3,
                next: 'abc',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "b"),
                $mol_jsx("p", { "data-rev": "old" }, "c"))).outerHTML);
        },
        'insert items'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "b"),
                $mol_jsx("p", { "data-rev": "old" }, "c"),
                $mol_jsx("p", { "data-rev": "old" }, "d"));
            $mol_reconcile({
                prev: [...list.children],
                from: 1,
                to: 3,
                next: 'bXYc',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "b"),
                $mol_jsx("p", { "data-rev": "new" }, "X"),
                $mol_jsx("p", { "data-rev": "new" }, "Y"),
                $mol_jsx("p", { "data-rev": "old" }, "c"),
                $mol_jsx("p", { "data-rev": "old" }, "d"))).outerHTML);
        },
        'append items'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"));
            $mol_reconcile({
                prev: [...list.children],
                from: 2,
                to: 3,
                next: 'bc',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "new" }, "b"),
                $mol_jsx("p", { "data-rev": "new" }, "c"))).outerHTML);
        },
        'split item'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "bc"),
                $mol_jsx("p", { "data-rev": "old" }, "d"));
            $mol_reconcile({
                prev: [...list.children],
                from: 0,
                to: 3,
                next: 'abcd',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "new" }, "b"),
                $mol_jsx("p", { "data-rev": "up" }, "c"),
                $mol_jsx("p", { "data-rev": "old" }, "d"))).outerHTML);
        },
        'drop items'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "A"),
                $mol_jsx("p", { "data-rev": "old" }, "B"),
                $mol_jsx("p", { "data-rev": "old" }, "x"),
                $mol_jsx("p", { "data-rev": "old" }, "y"),
                $mol_jsx("p", { "data-rev": "old" }, "C"),
                $mol_jsx("p", { "data-rev": "old" }, "D"));
            $mol_reconcile({
                prev: [...list.children],
                from: 1,
                to: 5,
                next: 'BC',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "A"),
                $mol_jsx("p", { "data-rev": "old" }, "B"),
                $mol_jsx("p", { "data-rev": "old" }, "C"),
                $mol_jsx("p", { "data-rev": "old" }, "D"))).outerHTML);
        },
        'update items'() {
            const list = $mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "old" }, "B"),
                $mol_jsx("p", { "data-rev": "old" }, "C"),
                $mol_jsx("p", { "data-rev": "old" }, "d"));
            $mol_reconcile({
                prev: [...list.children],
                from: 1,
                to: 3,
                next: 'XY',
                equal: (next, prev) => prev.textContent === next,
                drop: (prev, lead) => list.removeChild(prev),
                insert: (next, lead) => list.insertBefore($mol_jsx("p", { "data-rev": "new" }, next), lead ? lead.nextSibling : list.firstChild),
                replace: (next, prev, lead) => {
                    prev.textContent = next;
                    prev.setAttribute('data-rev', 'up');
                    return prev;
                },
            });
            $mol_assert_equal(list.outerHTML, ($mol_jsx("body", null,
                $mol_jsx("p", { "data-rev": "old" }, "a"),
                $mol_jsx("p", { "data-rev": "up" }, "X"),
                $mol_jsx("p", { "data-rev": "up" }, "Y"),
                $mol_jsx("p", { "data-rev": "old" }, "d"))).outerHTML);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Boolean schema"($) {
                $mol_assert_equal('$mol_schema_boolean', $mol_schema_boolean + '', $mol_key($mol_schema_boolean));
                $mol_assert_equal(true, $mol_schema_boolean.check(false));
                $mol_assert_equal(true, $mol_schema_boolean.check(true));
                $mol_assert_equal(false, $mol_schema_boolean.check('true'));
                $mol_assert_equal(false, $mol_schema_boolean.check(0));
                $mol_assert_equal(false, $mol_schema_boolean.cast(false));
                $mol_assert_equal(false, $mol_schema_boolean.cast('true'));
                $mol_assert_equal(false, $mol_schema_boolean.guard(false));
                $mol_assert_fail(() => $mol_schema_boolean.guard(null), 'Wrong type');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Integer schema"($) {
                $mol_assert_equal('$mol_schema_integer', $mol_schema_integer + '', $mol_key($mol_schema_integer));
                $mol_assert_equal(true, $mol_schema_integer.check(Number.MAX_SAFE_INTEGER));
                $mol_assert_equal(true, $mol_schema_integer.check(Number.MIN_SAFE_INTEGER));
                $mol_assert_equal(true, $mol_schema_integer.check(0));
                $mol_assert_equal(false, $mol_schema_integer.check(Number.EPSILON));
                $mol_assert_equal(false, $mol_schema_integer.check(Number.POSITIVE_INFINITY));
                $mol_assert_equal(false, $mol_schema_integer.check(Number.NEGATIVE_INFINITY));
                $mol_assert_equal(Number.MAX_SAFE_INTEGER, $mol_schema_integer.cast(Number.MAX_SAFE_INTEGER));
                $mol_assert_equal(0, $mol_schema_integer.cast(Number.EPSILON));
                $mol_assert_equal(0, $mol_schema_integer.cast(1.5));
                $mol_assert_equal(0, $mol_schema_integer.guard(0));
                $mol_assert_fail(() => $mol_schema_integer.guard(''), 'Wrong type');
                $mol_assert_fail(() => $mol_schema_integer.guard(Number.NaN), 'Non finite');
                $mol_assert_fail(() => $mol_schema_integer.guard(1.5), 'Non integer');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "BigInt schema"($) {
                $mol_assert_equal('$mol_schema_bigint', $mol_schema_bigint + '', $mol_key($mol_schema_bigint));
                $mol_assert_equal(true, $mol_schema_bigint.check(0n));
                $mol_assert_equal(false, $mol_schema_bigint.check(0));
                $mol_assert_equal(1n, $mol_schema_bigint.cast(1n));
                $mol_assert_equal(1n, $mol_schema_bigint.cast(1));
                $mol_assert_equal(0n, $mol_schema_bigint.guard(0n));
                $mol_assert_fail(() => $mol_schema_bigint.guard(1), 'Wrong type');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$mol_schema_pattern = $mol_memo_key.func(function $mol_schema_pattern(Pattern) {
        return class $mol_schema_pattern_ extends $mol_schema_string {
            static Pattern = Pattern;
            static toString() {
                if (this !== $mol_schema_pattern_)
                    return super.toString();
                return '$mol_schema_pattern<' + $mol_key(Pattern) + '>';
            }
            static guard(value) {
                if (Pattern.test(super.guard(value)))
                    return value;
                return $mol_fail(new TypeError('Wrong string', { cause: { value, schema: this } }));
            }
            static cast(value) {
                return super.cast(value);
            }
            static default = '';
        };
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Cache of pattern schema"($) {
                $mol_assert_equal($mol_schema_pattern(/foo/), $mol_schema_pattern(/foo/));
                $mol_assert_unique($mol_schema_pattern(/foo/), $mol_schema_pattern(/bar/));
            },
            "String pattern schema"($) {
                const Email = $mol_schema_pattern(/^.*@.*$/);
                $mol_assert_equal('$mol_schema_pattern</^.*@.*$/>', Email + '', $mol_key(Email));
                $mol_assert_equal(true, Email.check('foo@bar'));
                $mol_assert_equal(false, Email.check('foo'));
                $mol_assert_equal(false, Email.check(123));
                $mol_assert_equal('foo@bar', Email.cast('foo@bar'));
                $mol_assert_equal('', Email.cast('foo'));
                $mol_assert_equal('', Email.cast(123));
                $mol_assert_equal('foo@bar', Email.guard('foo@bar'));
                $mol_assert_fail(() => Email.guard('foo'), 'Wrong string');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        "Cache of dict schema"($) {
            $mol_assert_equal($mol_schema_dict([$mol_schema_string, $mol_schema_float]), $mol_schema_dict([$mol_schema_string, $mol_schema_float]));
            $mol_assert_unique($mol_schema_dict([$mol_schema_string, $mol_schema_float]), $mol_schema_dict([$mol_schema_string, $mol_schema_string]));
        },
        "Dictionary schema"($) {
            const Flags = $mol_schema_dict([$mol_schema_pattern(/^[a-z]+$/), $mol_schema_boolean]);
            $mol_assert_equal(true, Flags.check({}));
            $mol_assert_equal(true, Flags.check({ foo: false }));
            $mol_assert_equal(false, Flags.check({ f00: false }));
            $mol_assert_equal(false, Flags.check([]));
            $mol_assert_equal(false, Flags.check({ foo: 0 }));
            $mol_assert_equal({ foo: false }, Flags.cast({ foo: false, f00: true }));
            $mol_assert_equal({ foo: false }, Flags.cast({ foo: 123 }));
            $mol_assert_equal({}, Flags.guard({}));
            $mol_assert_equal({ foo: false }, Flags.guard({ foo: false }));
            $mol_assert_fail(() => Flags.guard({ foo: 123 }), 'Wrong val');
            $mol_assert_fail(() => Flags.guard({ f00: 123 }), 'Wrong key');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Cache of list schema"($) {
                $mol_assert_equal($mol_schema_list($mol_schema_float), $mol_schema_list($mol_schema_float));
                $mol_assert_unique($mol_schema_list($mol_schema_float), $mol_schema_list($mol_schema_string));
            },
            "Array schema"($) {
                const Vector = $mol_schema_list($mol_schema_float);
                $mol_assert_equal('$mol_schema_list<$mol_schema_float>', Vector + '');
                $mol_assert_equal(true, Vector.check([]));
                $mol_assert_equal(true, Vector.check([123]));
                $mol_assert_equal(false, Vector.check(['foo']));
                $mol_assert_equal([123], Vector.cast([123]));
                $mol_assert_equal([123, Number.NaN], Vector.cast([123, 'foo']));
                $mol_assert_equal([], Vector.guard([]));
                $mol_assert_equal([123], Vector.guard([123]));
                $mol_assert_fail(() => Vector.guard(0), 'Non array');
                $mol_assert_fail(() => Vector.guard([false]), 'Wrong item');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function clone(base) {
        const land = $mol_wire_sync(base.$.$giper_baza_land).make({ $: base.$ });
        land.units_steal(base);
        return land;
    }
    function sync(left, right) {
        left.units_steal(right);
        right.units_steal(left);
    }
    $mol_test({
        'Basic list ops'($) {
            const land = $.$giper_baza_land.make({ $ });
            const list = land.Pawn($giper_baza_list).Data();
            $mol_assert_equal(list.items_vary(), []);
            list.items_vary([2, 3]);
            $mol_assert_equal(list.items_vary(), [2, 3]);
            $mol_assert_equal(list.has(1), false);
            list.add(1);
            $mol_assert_equal(list.items_vary(), [1, 2, 3]);
            $mol_assert_equal(list.has(1), true);
            list.add(3);
            $mol_assert_equal(list.items_vary(), [1, 2, 3]);
            list.splice([2]);
            $mol_assert_equal(list.items_vary(), [1, 2, 3, 2]);
            list.splice([2], 0);
            $mol_assert_equal(list.items_vary(), [2, 1, 2, 3, 2]);
            list.wipe(2);
            $mol_assert_equal(list.items_vary(), [2, 1, 3, 2]);
            list.move(2, 1);
            $mol_assert_equal(list.items_vary(), [2, 3, 1, 2]);
            list.move(1, 3);
            $mol_assert_equal(list.items_vary(), [2, 1, 3, 2]);
            list.cut(2);
            $mol_assert_equal(list.items_vary(), [1, 3]);
            $mol_assert_equal(list.has(2), false);
            list.cut(2);
            $mol_assert_equal(list.items_vary(), [1, 3]);
        },
        'Different types'($) {
            const land = $.$giper_baza_land.make({ $ });
            const list = land.Pawn($.$giper_baza_list).Data();
            list.items_vary([
                null,
                false,
                true,
                0n,
                4611686018427387904n,
                0,
                Math.PI,
                Number.NaN,
                Number.NEGATIVE_INFINITY,
                '',
                '1234567890123456789012345678901234567890',
                new Uint8Array([]),
                new Uint8Array([1, 2, 3]),
                new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]),
                list.link(),
            ]);
            $mol_assert_equal(list.items_vary(), [
                false,
                true,
                0,
                4611686018427387904n,
                0,
                Math.PI,
                Number.NaN,
                Number.NEGATIVE_INFINITY,
                '',
                '1234567890123456789012345678901234567890',
                new Uint8Array([]),
                new Uint8Array([1, 2, 3]),
                new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]),
                list.link(),
            ]);
        },
        async 'List merge'($) {
            const land1 = $.$giper_baza_land.make({ $ });
            const land2 = $.$giper_baza_land.make({ $ });
            const list1 = land1.Pawn($giper_baza_list).Data();
            const list2 = land2.Pawn($giper_baza_list).Data();
            list1.items_vary(['foo', 'xxx']);
            land2.tick();
            list2.items_vary(['foo', 'yyy']);
            await $mol_wire_async(land1).units_steal(land2);
            $mol_assert_equal(list1.items_vary(), ['foo', 'yyy', 'foo', 'xxx']);
        },
        'Insert before removed before changed'($) {
            const land = $.$giper_baza_land.make({ $ });
            const list = land.Pawn($giper_baza_list).Data();
            list.items_vary(['foo', 'bar']);
            list.items_vary(['xxx', 'foo', 'bar']);
            list.items_vary(['xxx', 'bars']);
            $mol_assert_equal(list.items_vary(), ['xxx', 'bars']);
        },
        'Many moves'($) {
            const land = $.$giper_baza_land.make({ $ });
            const list = land.Pawn($giper_baza_list).Data();
            list.items_vary(['foo', 'bar', 'lol']);
            list.move(2, 1);
            list.move(2, 1);
            list.move(0, 3);
            list.move(2, 1);
            $mol_assert_equal(list.items_vary(), ['bar', 'foo', 'lol']);
        },
        'Reorder separated sublists'($) {
            const land = $.$giper_baza_land.make({ $ });
            const list = land.Pawn($giper_baza_list).Data();
            list.items_vary([1, 2, 3, 4, 5, 6]);
            list.move(3, 5);
            list.move(3, 5);
            list.move(5, 4);
            list.move(0, 2);
            list.move(0, 2);
            list.move(2, 1);
            $mol_assert_equal(list.items_vary(), [1, 3, 2, 4, 6, 5]);
        },
        'Insert after moved right': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 7, 2, 3, 4]);
            const right = clone(base);
            right.Data($giper_baza_list).move(0, 2);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [2, 1, 7, 3, 4]);
        }),
        'Insert before moved left': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).move(1, 0);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 7, 2, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [2, 1, 7, 3, 4]);
        }),
        'Move left after inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 7, 2, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).move(1, 0);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [2, 1, 3, 7, 4]);
        }),
        'Insert before moved right': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).move(1, 4);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 7, 2, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 7, 3, 4, 2]);
        }),
        'Move right after inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 7, 2, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).move(1, 4);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 3, 7, 4, 2]);
        }),
        'Insert after wiped': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 7, 3, 4]);
        }),
        'Wiped before inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 7, 3, 4]);
        }),
        'Insert before wiped': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).wipe(2);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 2, 7, 4]);
        }),
        'Wiped after inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).wipe(2);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 2, 7, 4]);
        }),
        'Insert after moved out': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.sand_move(left.Data($giper_baza_list).units()[1], new $giper_baza_link('11111111'), 0);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 7, 3, 4]);
            $mol_assert_equal(left.Pawn($giper_baza_list).Head(new $giper_baza_link('11111111')).items_vary(), right.Pawn($giper_baza_list).Head(new $giper_baza_link('11111111')).items_vary(), [2]);
        }),
        'Move out before inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.sand_move(right.Data($giper_baza_list).units()[1], new $giper_baza_link('11111111'), 0);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 7, 3, 4]);
            $mol_assert_equal(left.Pawn($giper_baza_list).Head(new $giper_baza_link('11111111')).items_vary(), right.Pawn($giper_baza_list).Head(new $giper_baza_link('11111111')).items_vary(), [2]);
        }),
        'Insert before changed': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 7, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 13, 3, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 2, 13, 7, 4]);
        }),
        'Change after inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 13, 3, 4]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 7, 4]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 2, 7, 13, 4]);
        }),
        'Insert between moved': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4, 5, 6]);
            const left = clone(base);
            left.Data($giper_baza_list).move(1, 5);
            left.Data($giper_baza_list).move(1, 5);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4, 5, 6]);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 4, 5, 2, 7, 3, 6]);
        }),
        'Move near inserted': $mol_wire_async(($) => {
            const base = $mol_wire_sync($.$giper_baza_land).make({ $ });
            base.Data($giper_baza_list).items_vary([1, 2, 3, 4, 5, 6]);
            const left = clone(base);
            left.Data($giper_baza_list).items_vary([1, 2, 7, 3, 4, 5, 6]);
            const right = clone(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_list).move(1, 5);
            right.Data($giper_baza_list).move(1, 5);
            sync(left, right);
            $mol_assert_equal(left.Data($giper_baza_list).items_vary(), right.Data($giper_baza_list).items_vary(), [1, 4, 5, 2, 3, 7, 6]);
        }),
        async '3 transactions in same second must keep ordering'($) {
            const auth_left = $.$giper_baza_auth.grab();
            const auth_right = $.$giper_baza_auth.grab();
            const land_left = $.$giper_baza_land.make({ $, auth: () => auth_left });
            land_left.give(auth_right.pass(), $giper_baza_rank_post('just'));
            const land_right = $.$giper_baza_land.make({ $, auth: () => auth_right, link: () => land_left.link() });
            const list_left = land_left.Data($giper_baza_list);
            const list_right = land_right.Data($giper_baza_list);
            list_left.items_vary(['a', 'b', 'c', 'd']);
            $mol_assert_equal(list_left.items_vary(), ['a', 'b', 'c', 'd']);
            await $mol_wire_async(land_right).units_steal(land_left);
            $mol_assert_equal(list_right.items_vary(), ['a', 'b', 'c', 'd']);
            list_right.splice(['x'], 0, 0);
            $mol_assert_equal(list_right.items_vary(), ['x', 'a', 'b', 'c', 'd']);
            await $mol_wire_async(land_left).units_steal(land_right);
            $mol_assert_equal(list_left.items_vary(), ['x', 'a', 'b', 'c', 'd']);
            list_left.items_vary(['d', 'x', 'a', 'b', 'c']);
            $mol_assert_equal(list_left.items_vary(), ['d', 'x', 'a', 'b', 'c']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'put, get, drop, count records and clear store'() {
            const db = await $$.$mol_db('$mol_db_test', mig => mig.store_make('letters'));
            const trans = db.change('letters');
            try {
                const { letters } = trans.stores;
                $mol_assert_like(await letters.get(1), undefined);
                $mol_assert_like(await letters.get(2), undefined);
                $mol_assert_like(await letters.count(), 0);
                await letters.put('a');
                await letters.put('b', 1);
                await letters.put('c', 2);
                $mol_assert_like(await letters.get(1), 'b');
                $mol_assert_like(await letters.get(2), 'c');
                $mol_assert_like(await letters.count(), 2);
                await letters.drop(1);
                $mol_assert_like(await letters.get(1), undefined);
                $mol_assert_like(await letters.count(), 1);
                await letters.clear();
                $mol_assert_like(await letters.count(), 0);
            }
            finally {
                trans.abort();
                db.kill();
            }
        },
        async 'select by query'() {
            const db = await $$.$mol_db('$mol_db_test', mig => mig.store_make('letters'));
            const trans = db.change('letters');
            try {
                const { letters } = trans.stores;
                await letters.put('a');
                await letters.put('b');
                await letters.put('c');
                await letters.put('d');
                $mol_assert_like(await letters.select(), ['a', 'b', 'c', 'd']);
                $mol_assert_like(await letters.select(null, 2), ['a', 'b']);
                $mol_assert_like(await letters.select($mol_dom_context.IDBKeyRange.bound(2, 3)), ['b', 'c']);
            }
            finally {
                trans.abort();
                db.kill();
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'take and drop db'() {
            const db = await $$.$mol_db('$mol_db_test');
            await db.kill();
        },
        async 'make and drop store in separate migrations'() {
            try {
                const db1 = await $$.$mol_db('$mol_db_test', mig => mig.store_make('temp'));
                db1.destructor();
                $mol_assert_like(db1.stores, ['temp']);
                $mol_assert_like(db1.version, 2);
                const db2 = await $$.$mol_db('$mol_db_test', mig => mig.store_make('temp'), mig => mig.store_drop('temp'));
                db2.destructor();
                $mol_assert_like(db2.stores, []);
                $mol_assert_like(db2.version, 3);
            }
            finally {
                const db0 = await $$.$mol_db('$mol_db_test');
                await db0.kill();
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        async 'unique index'() {
            const db = await $$.$mol_db('$mol_db_test', mig => mig.store_make('users'), mig => mig.stores.users.index_make('names', ['name'], true));
            const trans = db.change('users');
            try {
                const { users } = trans.stores;
                await users.put({ name: 'Jin' }, 'jin');
                await users.put({ name: 'John' }, 'john');
                await users.put({ name: 'Bin' }, 'bin');
                const { names } = users.indexes;
                $mol_assert_like(await names.get(['Jin']), { name: 'Jin' });
                $mol_assert_like(await names.get(['John']), { name: 'John' });
                $mol_assert_like(await names.count(), 3);
                $mol_assert_like(await names.select($mol_dom_context.IDBKeyRange.bound(['J'], ['J\uFFFF'])), [{ name: 'Jin' }, { name: 'John' }]);
                try {
                    await users.put({ name: 'Jin' }, 'jin2');
                    $mol_fail(new Error('Exception expected'));
                }
                catch (error) {
                    $mol_assert_unique(error.message, 'Exception expected');
                }
            }
            finally {
                trans.abort();
                await db.kill();
            }
        },
        async 'multi path index'() {
            const db = await $$.$mol_db('$mol_db_test', mig => mig.store_make('users'), mig => mig.stores.users.index_make('names', ['first', 'last']));
            const trans = db.change('users');
            try {
                const { users } = trans.stores;
                await users.put({ first: 'Jin', last: 'Johnson' }, 'jin');
                await users.put({ first: 'John', last: 'Jinson' }, 'john');
                await users.put({ first: 'Bond', last: 'James' }, '007');
                const { names } = users.indexes;
                $mol_assert_like(await names.get(['Jin', 'Johnson']), { first: 'Jin', last: 'Johnson' });
                $mol_assert_like(await names.get(['John', 'Jinson']), { first: 'John', last: 'Jinson' });
                $mol_assert_like(await names.count(), 3);
                $mol_assert_like(await names.select($mol_dom_context.IDBKeyRange.bound(['Jin', 'Johnson'], ['John', 'Jinson'])), [{ first: 'Jin', last: 'Johnson' }, { first: 'John', last: 'Jinson' }]);
            }
            finally {
                trans.abort();
                await db.kill();
            }
        },
        async 'multiple indexes'() {
            const db = await $$.$mol_db('$mol_db_test', mig => mig.store_make('users'), mig => mig.stores.users.index_make('names', ['name'], true), mig => mig.stores.users.index_make('ages', ['age']));
            const trans = db.change('users');
            try {
                const { users } = trans.stores;
                await users.put({ name: 'Jin', age: 18 }, 'jin');
                await users.put({ name: 'John', age: 18 }, 'john');
                const { names, ages } = users.indexes;
                $mol_assert_like(await names.select(['Jin']), [{ name: 'Jin', age: 18 }]);
                $mol_assert_like(await names.select(['John']), [{ name: 'John', age: 18 }]);
                $mol_assert_like(await names.count(), 2);
                $mol_assert_like(await ages.select([18]), [{ name: 'Jin', age: 18 }, { name: 'John', age: 18 }]);
                $mol_assert_like(await ages.count(), 2);
            }
            finally {
                trans.abort();
                await db.kill();
            }
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $giper_baza_mine_mock extends $.$giper_baza_mine_temp {
        }
        $.$giper_baza_mine = $giper_baza_mine_mock;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "faces serial and parse"($) {
                const land1 = new $giper_baza_link('12345678_12345678');
                const land2 = new $giper_baza_link('87654321_87654321');
                const land3 = new $giper_baza_link('87654321_00000000');
                const peer1 = new $giper_baza_link('12345678');
                const peer2 = new $giper_baza_link('87654321');
                const faces1 = new $giper_baza_face_map;
                faces1.peer_time(peer1.str, $giper_baza_time_now(), 0);
                faces1.peer_summ(peer1.str, 0);
                faces1.peer_time(peer2.str, $giper_baza_time_now(), 0);
                faces1.peer_summ(peer2.str, 64_000);
                const faces2 = new $giper_baza_face_map;
                faces2.peer_time(peer1.str, $giper_baza_time_now(), 0);
                faces2.peer_summ(peer1.str, 1);
                faces2.peer_time(peer2.str, $giper_baza_time_now(), 1);
                const faces3 = new $giper_baza_face_map;
                const parts = [
                    [land1.str, new $giper_baza_pack_part([], faces1)],
                    [land2.str, new $giper_baza_pack_part([], faces2)],
                    [land3.str, new $giper_baza_pack_part([], faces3)],
                ];
                const pack = $giper_baza_pack.make(parts);
                $mol_assert_equal(parts, pack.parts());
            },
            "units serial and parse"($) {
                const land = new $giper_baza_link('12345678_12345678');
                const pass = $.$giper_baza_auth.grab().pass();
                const gift = $giper_baza_unit_gift.make();
                const sand_small = $giper_baza_unit_sand.make(5);
                const ball = new Uint8Array($giper_baza_unit_sand.size_equator + 5);
                const sand_big = $giper_baza_unit_sand.make(ball.byteLength);
                sand_big.ball(ball);
                const seal = $giper_baza_unit_seal.make(15, true);
                const parts = [
                    [land.str, new $giper_baza_pack_part([pass, gift, sand_small, sand_big, seal])],
                ];
                const pack = $giper_baza_pack.make(parts);
                $mol_assert_equal(parts, pack.parts());
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $giper_baza_yard_mock extends $.$giper_baza_yard {
            master() {
                return null;
            }
        }
        $.$giper_baza_yard = $giper_baza_yard_mock;
    });
    $giper_baza_yard.masters_override = () => ['http://localhost:9090/'];
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $.$mol_schema_enum = $mol_memo_key.func(function $mol_schema_enum(Options) {
        return class $mol_schema_enum_ extends $mol_schema_any {
            static Options = Options;
            static toString() {
                if (this !== $mol_schema_enum_)
                    return super.toString();
                return '$mol_schema_enum<' + $mol_key(Options) + '>';
            }
            static guard(value) {
                if (Options.some(Option => Object.is(Option, value)))
                    return value;
                return $mol_fail(new TypeError('Wrong option', { cause: { value, schema: this } }));
            }
            static cast(value) {
                if (this.check(value))
                    return value;
                return Options[0];
            }
            static default = Options[0];
        };
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Cache of enum schema"($) {
                $mol_assert_equal($mol_schema_enum(['foo']), $mol_schema_enum(['foo']));
                $mol_assert_unique($mol_schema_enum(['foo']), $mol_schema_enum(['bar']));
            },
            "Enum options"($) {
                const Config = $mol_schema_enum([123, 'foo']);
                $mol_assert_equal('$mol_schema_enum<[123,"foo"]>', Config + '', $mol_key(Config));
                $mol_assert_equal(true, Config.check(123));
                $mol_assert_equal(true, Config.check('foo'));
                $mol_assert_equal(false, Config.check(true));
                $mol_assert_equal(false, Config.check(321));
                $mol_assert_equal(false, Config.check('bar'));
                $mol_assert_equal(Config.cast(123), 123);
                $mol_assert_equal(Config.cast('foo'), 'foo');
                $mol_assert_equal(Config.cast('bar'), 123);
                $mol_assert_equal(123, Config.guard(123));
                $mol_assert_fail(() => Config.guard(321), 'Wrong option');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Empty representation"($) {
                const land = $giper_baza_land.make({ $ });
                const reg = land.Pawn($giper_baza_atom_time).Data();
                $mol_assert_equal(reg.val(), null);
                reg.vary(null);
                $mol_assert_equal(reg.val(), null);
            },
            "Validation on set, cast on get"($) {
                const land = $.$giper_baza_glob.home().land();
                const head = new $giper_baza_link('22222222');
                const str = land.Pawn($giper_baza_atom.of($mol_schema_maybe($mol_schema_string))).Head(head);
                const mail = land.Pawn($giper_baza_atom.of($mol_schema_pattern(/.+@.+/))).Head(head);
                $mol_assert_equal(str.val(), null);
                $mol_assert_equal(mail.val(), null);
                $mol_assert_fail(() => str.val(123), 'Wrong type');
                $mol_assert_fail(() => mail.val('foo'), 'Wrong string');
                $mol_assert_equal(str.val(), null);
                $mol_assert_equal(mail.val(), null);
                str.val('foo');
                $mol_assert_equal(str.val(), 'foo');
                $mol_assert_equal(mail.val(), null);
                mail.val('foo@bar');
                $mol_assert_equal(str.val(), 'foo@bar');
                $mol_assert_equal(mail.val(), 'foo@bar');
            },
            "Hyper link to another land"($) {
                const land = $.$giper_baza_glob.home().land();
                const reg = land.Pawn($giper_baza_atom_link.to(() => $giper_baza_atom)).Head(new $giper_baza_link('11111111'));
                const remote = reg.ensure(land);
                $mol_assert_unique(reg.land(), remote.land());
                $mol_assert_equal(reg.vary(), remote.link());
                $mol_assert_equal(reg.remote(), remote);
            },
            "Register with linked Pawns"($) {
                const land = $.$giper_baza_glob.home().land();
                const str = land.Pawn($giper_baza_atom_text).Head(new $giper_baza_link('11111111'));
                const link = land.Pawn($giper_baza_atom_link.to(() => $giper_baza_atom_text)).Head(new $giper_baza_link('11111111'));
                $mol_assert_equal(link.remote(), null);
                link.remote(str);
                $mol_assert_equal(link.vary(), link.remote().link(), str.link());
            },
            "Enumerated reg type"($) {
                class FileType extends $giper_baza_atom.of($mol_schema_maybe($mol_schema_enum(['file', 'dir', 'link']))) {
                }
                const land = $.$giper_baza_glob.home().land();
                const type = land.Data(FileType);
                $mol_assert_equal(type.val(), null);
                type.val('file');
                $mol_assert_equal(type.val(), 'file');
                $mol_assert_fail(() => type.val('drive'), 'Wrong option');
                $mol_assert_equal(type.val(), 'file');
                type.vary('drive');
                $mol_assert_equal(type.val(), null);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            async 'Dictionary invariants'($) {
                const land = $giper_baza_land.make({ $ });
                const dict = land.Pawn($giper_baza_dict).Data();
                $mol_assert_equal(dict.keys(), []);
                dict.dive(123, $giper_baza_atom, null);
                dict.dive('xxx', $giper_baza_atom, null);
                $mol_assert_equal(dict.keys(), ['xxx', 123]);
                $mol_assert_equal(dict.has(123), true);
                $mol_assert_equal(dict.has('xxx'), true);
                $mol_assert_equal(dict.has('yyy'), false);
                $mol_assert_equal(dict.dive(123, $giper_baza_atom).vary(), null);
                $mol_assert_equal(dict.dive('xxx', $giper_baza_atom).vary(), null);
                dict.dive(123, $giper_baza_atom).vary(777);
                $mol_assert_equal(dict.dive(123, $giper_baza_atom).vary(), 777);
                dict.dive('xxx', $giper_baza_list).items_vary(['foo', 'bar']);
                $mol_assert_equal(dict.dive('xxx', $giper_baza_list).items_vary(), ['foo', 'bar']);
                dict.has(123, false);
                $mol_assert_equal(dict.keys(), ['xxx']);
            },
            async 'Dictionary merge'($) {
                const land1 = $giper_baza_land.make({ $ });
                const land2 = $giper_baza_land.make({ $ });
                const dict1 = land1.Pawn($giper_baza_dict).Data();
                const dict2 = land2.Pawn($giper_baza_dict).Data();
                dict1.dive(123, $giper_baza_atom, null).vary(666);
                land2.tick();
                dict2.dive(123, $giper_baza_atom, null).vary(777);
                await $mol_wire_async(land1).units_steal(land2);
                $mol_assert_equal(dict1.dive(123, $giper_baza_atom).vary(), 777);
                dict1.dive('xxx', $giper_baza_list, null).items_vary(['foo']);
                land2.tick();
                dict2.dive('xxx', $giper_baza_list, null).items_vary(['bar']);
                await $mol_wire_async(land1).units_steal(land2);
                $mol_assert_equal(dict1.dive('xxx', $giper_baza_list).items_vary(), ['bar', 'foo']);
            },
            async "Narrowed Dictionary with linked Dictionaries and others"($) {
                class User extends $giper_baza_dict.with({
                    Title: $giper_baza_atom_text,
                    Account: $giper_baza_atom_link.to(() => Account),
                    Articles: $giper_baza_list_link.to(() => Article),
                }) {
                }
                class Account extends $giper_baza_dict.with({
                    Title: $giper_baza_atom_text,
                    User: $giper_baza_atom_link.to(() => User),
                }) {
                }
                class Article extends $giper_baza_dict.with({
                    Title: $giper_baza_dict_to($giper_baza_atom_text),
                    Author: $giper_baza_atom_link.to(() => User),
                }) {
                }
                const land = $.$giper_baza_glob.home().land();
                const user = land.Pawn(User).Head(new $giper_baza_link('11111111'));
                $mol_assert_equal(user.Title()?.val() ?? null, null);
                $mol_assert_equal(user.Account()?.remote() ?? null, null);
                $mol_assert_equal(user.Articles()?.remote_list() ?? [], []);
                user.Title(null).val('Jin');
                $mol_assert_equal(user.Title().val() ?? '', 'Jin');
                const account = (await $mol_wire_async(user.Account(null)).ensure([[null, $giper_baza_rank_read]]));
                $mol_assert_equal(user.Account()?.remote() ?? null, account);
                $mol_assert_equal(account.User()?.remote() ?? null, null);
                account.User(null).remote(user);
                $mol_assert_equal(account.User()?.remote(), user);
                const articles = [
                    await $mol_wire_async(user.Articles(null)).make([[null, $giper_baza_rank_read]]),
                    await $mol_wire_async(user.Articles(null)).make([[null, $giper_baza_rank_read]]),
                ];
                $mol_assert_equal(user.Articles()?.remote_list().map(n => n[Symbol.toStringTag]), articles.map(n => n[Symbol.toStringTag]));
                articles[0].Title(null).key('en', 'auto').val('Hello!');
                $mol_assert_equal(articles[0].Title()?.key('en').val(), 'Hello!');
                $mol_assert_equal(articles[1].Title()?.key('ru')?.val() ?? null, null);
                $mol_assert_equal(articles[1].Title()?.key('ru')?.val() ?? null, null);
                $mol_assert_unique(user.land(), account.land(), ...articles.map(article => article.land()));
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test_mocks.push($ => {
        class $giper_baza_glob_mock extends $.$giper_baza_glob {
            static $ = $;
            static lands_touched = new $mol_wire_set();
        }
        $.$giper_baza_glob = $giper_baza_glob_mock;
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            'Отпущенная строка доезжает по порогу или по скорости'($) {
                const row = $bog_gram_row.make({ $ });
                $mol_assert_equal(row.swipe_settle(70, 0, 120), true);
                $mol_assert_equal(row.swipe_settle(50, 0, 120), false);
                $mol_assert_equal(row.swipe_settle(20, 0.5, 120), true);
                $mol_assert_equal(row.swipe_settle(100, -0.5, 120), false);
            },
            'Направление решают первые пиксели, вертикаль и шаг назад отдаются прокрутке'($) {
                const row = $bog_gram_row.make({ $ });
                $mol_assert_equal(row.swipe_axis(3, 2, 0), 'wait');
                $mol_assert_equal(row.swipe_axis(12, 3, 0), 'drag');
                $mol_assert_equal(row.swipe_axis(4, 12, 0), 'skip');
                $mol_assert_equal(row.swipe_axis(-12, 3, 0), 'skip');
                $mol_assert_equal(row.swipe_axis(-12, 3, 120), 'drag');
            },
            'Открытая строка сдвинута на ширину кнопок, тянущаяся — на палец'($) {
                const row = $bog_gram_row.make({ $ });
                row.swipe_width = 120;
                $mol_assert_equal(row.swipe_shift(), 0);
                row.swipe_open(true);
                $mol_assert_equal(row.swipe_shift(), 120);
                row.swipe_drag(40);
                $mol_assert_equal(row.swipe_shift(), 40);
                $mol_assert_equal(row.swipe_dragging(), true);
            },
            'Мышь тянет строку как палец, клик после тяги гасится, без тяги открывает'($) {
                let clicks = 0;
                const row = $bog_gram_row.make({ $,
                    swipe: () => true,
                    tools: () => [new $mol_view],
                    click: () => { ++clicks; return null; },
                });
                row.swipe_measure = () => { row.swipe_width = 120; };
                const at = (x, time) => ({ pointerType: 'mouse', button: 0, pointerId: 1, clientX: x, clientY: 10, timeStamp: time });
                row.swipe_start(at(0, 0));
                for (let x = 4; x <= 100; x += 4)
                    row.swipe_move(at(x, x * 10));
                row.swipe_end(at(100, 1000));
                $mol_assert_equal(row.swipe_open(), true);
                row.event_activate({});
                $mol_assert_equal(clicks, 0);
                row.swipe_start(at(50, 2000));
                row.swipe_end(at(50, 2010));
                row.event_activate({});
                $mol_assert_equal(clicks, 1);
            },
            'Тачпад: горизонтальная прокрутка двигает строку, вертикальная и шаг влево у закрытой — нет'($) {
                const row = $bog_gram_row.make({ $,
                    swipe: () => true,
                    tools: () => [new $mol_view],
                });
                row.swipe_measure = () => { row.swipe_width = 120; };
                let stopped = 0;
                const wheel = (deltaX, deltaY) => row.swipe_wheel({ deltaX, deltaY, preventDefault: () => { ++stopped; } });
                for (let i = 0; i < 10; ++i)
                    wheel(0, 10);
                row.swipe_wheel_end();
                $mol_assert_equal(stopped, 0);
                $mol_assert_equal(row.swipe_open(), false);
                for (let i = 0; i < 10; ++i)
                    wheel(10, 1);
                row.swipe_wheel_end();
                $mol_assert_equal(stopped, 0);
                $mol_assert_equal(row.swipe_open(), false);
                for (let i = 0; i < 10; ++i)
                    wheel(-8, 1);
                $mol_assert_equal(row.swipe_shift(), 80);
                row.swipe_wheel_end();
                $mol_assert_equal(row.swipe_open(), true);
                $mol_assert_equal(stopped > 0, true);
                for (let i = 0; i < 10; ++i)
                    wheel(8, 0);
                row.swipe_wheel_end();
                $mol_assert_equal(row.swipe_open(), false);
            },
            'Фокус клавиатуры на кнопке открывает строку'($) {
                const row = $bog_gram_row.make({ $,
                    swipe: () => true,
                    tools: () => [new $mol_view],
                });
                row.swipe_measure = () => { row.swipe_width = 120; };
                row.swipe_focus({ target: row.Info().dom_node() });
                $mol_assert_equal(row.swipe_open(), false);
                row.swipe_focus({ target: row.Tools().dom_node() });
                $mol_assert_equal(row.swipe_open(), true);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        '$mol_syntax2_md_flow'() {
            const check = (input, right) => {
                const tokens = [];
                $mol_syntax2_md_flow.tokenize(input, (...token) => tokens.push(token));
                $mol_assert_equal(tokens, right);
            };
            check('Hello,\nWorld..\r\n\r\n\nof Love!', [
                ['block', 'Hello,\n', ['Hello,', '\n'], 0],
                ['block', 'World..\r\n\r\n\n', ['World..', '\r\n\r\n\n'], 7],
                ['block', 'of Love!', ['of Love!', ''], 19],
            ]);
            check('# Header1\n\nHello!\n\n## Header2', [
                ['header', '# Header1\n\n', ['#', ' ', 'Header1', '\n\n'], 0],
                ['block', 'Hello!\n\n', ['Hello!', '\n\n'], 11],
                ['header', '## Header2', ['##', ' ', 'Header2', ''], 19],
            ]);
            check('```\nstart()\n```\n\n```jam.js\nrestart()\n```\n\nHello!\n\n```\nstop()\n```', [
                ['code', '```\nstart()\n```\n\n', ['```', '', 'start()\n', '```', '\n\n'], 0],
                ['code', '```jam.js\nrestart()\n```\n\n', ['```', 'jam.js', 'restart()\n', '```', '\n\n'], 17],
                ['block', 'Hello!\n\n', ['Hello!', '\n\n'], 42],
                ['code', '```\nstop()\n```', ['```', '', 'stop()\n', '```', ''], 50],
            ]);
            check('| header1 | header2\n|----|----\n| Cell11 | Cell12\n| Cell21 | Cell22\n\n| Cell11 | Cell12\n| Cell21 | Cell22\n', [
                ['table', '| header1 | header2\n|----|----\n| Cell11 | Cell12\n| Cell21 | Cell22\n\n', ['| header1 | header2\n|----|----\n| Cell11 | Cell12\n| Cell21 | Cell22\n', '\n'], 0],
                ['table', '| Cell11 | Cell12\n| Cell21 | Cell22\n', ['| Cell11 | Cell12\n| Cell21 | Cell22\n', ''], 68],
            ]);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'empty string'() {
            $mol_assert_equal(''.match($giper_baza_text_tokens), null);
        },
        'new lines'() {
            $mol_assert_equal('\n\r\n'.match($giper_baza_text_tokens), ['\n', '\r\n']);
        },
        'numbers'() {
            $mol_assert_equal('123'.match($giper_baza_text_tokens), ['123']);
        },
        'emoji'() {
            $mol_assert_equal('😀😁'.match($giper_baza_text_tokens), ['😀', '😁']);
        },
        'emoji with modifier'() {
            $mol_assert_equal('👩🏿👩🏿'.match($giper_baza_text_tokens), ['👩🏿', '👩🏿']);
        },
        'combo emoji with modifier'() {
            $mol_assert_equal('👩🏿‍🤝‍🧑🏿👩🏿‍🤝‍🧑🏿'.match($giper_baza_text_tokens), ['👩🏿‍🤝‍🧑🏿', '👩🏿‍🤝‍🧑🏿']);
        },
        'word with spaces'() {
            $mol_assert_equal('foo1  bar2'.match($giper_baza_text_tokens), ['foo1', ' ', ' bar2']);
        },
        'word with diactric'() {
            $mol_assert_equal('Е́е́'.match($giper_baza_text_tokens), ['Е́е́']);
        },
        'word with punctuation'() {
            $mol_assert_equal('foo--bar'.match($giper_baza_text_tokens), ['foo', '--', 'bar']);
        },
        'CamelCase'() {
            $mol_assert_equal('Foo1BAR2'.match($giper_baza_text_tokens), ['Foo1', 'BAR2']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Change sequences'($) {
            const land = $giper_baza_land.make({ $ });
            const text = land.Data($giper_baza_text);
            const list = land.Data($giper_baza_list);
            $mol_assert_equal(text.str(), '');
            $mol_assert_equal(list.items_vary(), []);
            text.str('foo');
            $mol_assert_equal(text.str(), 'foo');
            $mol_assert_equal(list.items_vary(), ['foo']);
            text.str('foo bar');
            $mol_assert_equal(text.str(), 'foo bar');
            $mol_assert_equal(list.items_vary(), ['foo', ' bar']);
            text.str('foo lol bar');
            $mol_assert_equal(text.str(), 'foo lol bar');
            $mol_assert_equal(list.items_vary(), ['foo', ' lol', ' bar']);
            text.str('lol bar');
            $mol_assert_equal(text.str(), 'lol bar');
            $mol_assert_equal(list.items_vary(), ['lol', ' bar']);
            text.str('foo bar');
            $mol_assert_equal(text.str(), 'foo bar');
            $mol_assert_equal(list.items_vary(), ['foo', ' bar']);
            text.str('foo  bar');
            $mol_assert_equal(text.str(), 'foo  bar');
            $mol_assert_equal(list.items_vary(), ['foo', ' ', ' bar']);
            text.str('foo  BarBar');
            $mol_assert_equal(text.str(), 'foo  BarBar');
            $mol_assert_equal(list.items_vary(), ['foo', ' ', ' Bar', 'Bar']);
        },
        async 'str: Offset <=> Point'($) {
            const land = $giper_baza_land.make({ $ });
            const text = land.Data($giper_baza_text);
            text.str('fooBar');
            const [first, second] = text.units();
            $mol_assert_equal(text.point_by_offset(0), [first.self().str, 0, 0]);
            $mol_assert_equal(text.offset_by_point([first.self().str, 0, 0]), [first.self().str, 0]);
            $mol_assert_equal(text.point_by_offset(3), [first.self().str, 3, 0]);
            $mol_assert_equal(text.offset_by_point([first.self().str, 3, 0]), [first.self().str, 3]);
            $mol_assert_equal(text.offset_by_point([first.self().str, 5, 0]), [first.self().str, 5]);
            $mol_assert_equal(text.point_by_offset(5), [second.self().str, 2, 0]);
            $mol_assert_equal(text.offset_by_point([second.self().str, 2, 0]), [second.self().str, 5]);
            $mol_assert_equal(text.point_by_offset(6), [second.self().str, 3, 0]);
            $mol_assert_equal(text.offset_by_point([second.self().str, 3, 0]), [second.self().str, 6]);
            $mol_assert_equal(text.point_by_offset(7), ['', 1, 0]);
            $mol_assert_equal(text.offset_by_point(['', 1, 0]), ['', 7]);
        },
        async 'text: Offset <=> Point'($) {
            const land = $giper_baza_land.make({ $ });
            const text = land.Data($giper_baza_text);
            text.text('foo bar\n666 777');
            const [first, second] = text.pawns($giper_baza_text);
            $mol_assert_equal(text.point_by_offset(0), [first.units()[0].self().str, 0, 0]);
            $mol_assert_equal(text.offset_by_point([first.units()[0].self().str, 0, 0]), [first.units()[0].self().str, 0]);
            $mol_assert_equal(text.point_by_offset(8), [first.units()[2].self().str, 1, 0]);
            $mol_assert_equal(text.offset_by_point([first.units()[2].self().str, 1, 0]), [first.units()[2].self().str, 8]);
        },
        async 'Merge different sequences'($) {
            const land1 = $giper_baza_land.make({ $ });
            const land2 = $giper_baza_land.make({ $ });
            const text1 = land1.Pawn($giper_baza_text).Data();
            const text2 = land2.Pawn($giper_baza_text).Data();
            text1.str('foo bar.');
            land2.faces.stat.time = land1.faces.stat.time;
            text2.str('xxx yyy.');
            const delta1 = await $mol_wire_async(land1).diff_units();
            const delta2 = await $mol_wire_async(land2).diff_units();
            await $mol_wire_async(land1).diff_apply(delta2);
            await $mol_wire_async(land2).diff_apply(delta1);
            $mol_assert_equal(text1.str(), text2.str(), 'xxx yyy.foo bar.');
        },
        async 'Merge same insertions with different changes to same place'($) {
            const base = $giper_baza_land.make({ $ });
            base.Data($giper_baza_text).str('( )');
            const left = $giper_baza_land.make({ $ });
            await $mol_wire_async(left).units_steal(base);
            left.Data($giper_baza_text).str('( [ f ] )');
            left.Data($giper_baza_text).str('( [ foo ] )');
            const right = $giper_baza_land.make({ $ });
            await $mol_wire_async(right).units_steal(base);
            right.faces.sync(left.faces);
            right.Data($giper_baza_text).str('( [ f ] )');
            right.Data($giper_baza_text).str('( [ fu ] )');
            const left_delta = await $mol_wire_async(left).diff_units(base.faces);
            const right_delta = await $mol_wire_async(right).diff_units(base.faces);
            await $mol_wire_async(left).diff_apply(right_delta);
            await $mol_wire_async(right).diff_apply(left_delta);
            $mol_assert_equal(left.Data($giper_baza_text).str(), right.Data($giper_baza_text).str(), '( [ fu ] [ foo ] )');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function html(dom) {
        return dom.html().replace(/ (id|xmlns)=".+?"/g, '');
    }
    $mol_test({
        'plain text'($) {
            const left = $giper_baza_land.make({ $ }).Data($giper_baza_rich);
            left.html('foo bar');
            $mol_assert_equal(html(left), '<span>foo</span><span> bar</span>');
        },
        'simple tags'($) {
            const left = $giper_baza_land.make({ $ }).Data($giper_baza_rich);
            left.html('<br /><hr />');
            $mol_assert_equal(html(left), '<br /><hr />');
        },
        'tags with attrs'($) {
            const left = $giper_baza_land.make({ $ }).Data($giper_baza_rich);
            left.html('<br hidden="" /><hr tabindex="-1" />');
            $mol_assert_equal(html(left), '<br hidden="" /><hr tabindex="-1" />');
        },
        'nested tags'($) {
            const left = $giper_baza_land.make({ $ }).Data($giper_baza_rich);
            left.html('<p><br /></p>');
            $mol_assert_equal(html(left), '<p><br /></p>');
        },
        'paragraphs'($) {
            const left = $giper_baza_land.make({ $ }).Data($giper_baza_rich);
            left.html('<p>foo bar</p><p>xxx yyy</p>');
            $mol_assert_equal(html(left), '<p><span>foo</span><span> bar</span></p><p><span>xxx</span><span> yyy</span></p>');
        },
        'import exported html'($) {
            const left = $giper_baza_land.make({ $ }).Data($giper_baza_rich);
            left.html('foo<a data-xxx="yyy" href="hhh:zzz">ton</a>bar');
            const right = $giper_baza_land.make({ $ }).Data($giper_baza_rich);
            right.html(left.html());
            $mol_assert_equal(html(left), html(right));
            $mol_assert_equal(left.html(), right.html());
        },
        'import wild spans'($) {
            const left = $giper_baza_land.make({ $ }).Data($giper_baza_rich);
            left.html('<span>foo bar<a href="hhh:ton"/></span>');
            $mol_assert_equal(html(left), '<span>foo</span><span> bar</span><a href="hhh:ton"></a>');
        },
    });
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($) {
    $mol_test({
        'Attach to document'() {
            const doc = $mol_dom_parse('<html><body id="foo"></body></html>');
            $mol_jsx_attach(doc, () => $mol_jsx("body", { id: "foo" }, "bar"));
            $mol_assert_equal(doc.documentElement.outerHTML, '<html><body id="foo">bar</body></html>');
        },
    });
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Head"($) {
                const div = $mol_jsx("div", null, "foo");
                $mol_assert_equal($mol_dom_point.head(div), new $mol_dom_point(div, 0));
                $mol_assert_equal($mol_dom_point.head(div).is_head(), true);
                $mol_assert_equal(new $mol_dom_point(div.firstChild, 1).is_head(), false);
            },
            "Foot"($) {
                const div = $mol_jsx("div", null, "foo");
                $mol_assert_equal($mol_dom_point.foot(div), new $mol_dom_point(div, 1), $mol_dom_point.tail(div.firstChild));
                $mol_assert_equal($mol_dom_point.foot(div).is_foot(), true);
                $mol_assert_equal(new $mol_dom_point(div.firstChild, 2).is_foot(), false);
            },
            "Near & jump"($) {
                const div = $mol_jsx("div", null,
                    "123",
                    $mol_jsx("span", null, "foo"),
                    "456");
                const span = div.childNodes[1];
                $mol_assert_equal(new $mol_dom_point(div, 1), $mol_dom_point.near(span, -1), new $mol_dom_point(span, 1).jump(-1));
                $mol_assert_equal(new $mol_dom_point(div, 2), $mol_dom_point.near(span, +1), new $mol_dom_point(span, 1).jump(+1));
            },
            "Lift points to common parent"($) {
                const div = $mol_jsx("div", null,
                    "123",
                    $mol_jsx("p", null,
                        $mol_jsx("span", null, "one")),
                    "456");
                const para = div.firstChild.nextSibling;
                const deep = para.firstChild.firstChild;
                $mol_assert_equal($mol_dom_point.head(deep).lifted_to(div), para);
                $mol_assert_equal($mol_dom_point.head(div.firstChild).lifted_to(div), div.firstChild);
            },
            "move by steps to the end"($) {
                const div = $mol_jsx("div", null,
                    "1",
                    $mol_jsx("span", null, "23"),
                    $mol_jsx("br", null),
                    "4");
                const span = div.childNodes[1];
                const br = div.childNodes[2];
                let cursor = $mol_dom_point.head(div);
                $mol_assert_equal([
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                    cursor = cursor.move_step(+1),
                ], [
                    $mol_dom_point.head(div.firstChild),
                    $mol_dom_point.foot(div.firstChild),
                    $mol_dom_point.tail(div.firstChild),
                    $mol_dom_point.head(span),
                    $mol_dom_point.head(span.firstChild),
                    new $mol_dom_point(span.firstChild, 1),
                    $mol_dom_point.foot(span.firstChild),
                    $mol_dom_point.tail(span.firstChild),
                    $mol_dom_point.tail(span),
                    $mol_dom_point.head(br),
                    $mol_dom_point.tail(br),
                    $mol_dom_point.head(div.lastChild),
                    $mol_dom_point.foot(div.lastChild),
                    $mol_dom_point.tail(div.lastChild),
                    null,
                ]);
            },
            "move by chars to the end"($) {
                const div = $mol_jsx("div", null,
                    "1",
                    $mol_jsx("span", null, "23"),
                    $mol_jsx("br", null),
                    "4");
                const span = div.childNodes[1];
                const br = div.childNodes[2];
                let start = $mol_dom_point.head(div);
                $mol_assert_equal([
                    start.move_chars(div, +0),
                    start.move_chars(div, +1),
                    start.move_chars(div, +2),
                    start.move_chars(div, +3),
                    start.move_chars(div, +4),
                    start.move_chars(div, +5),
                ], [
                    $mol_dom_point.head(div),
                    $mol_dom_point.foot(div.firstChild),
                    new $mol_dom_point(span.firstChild, 1),
                    $mol_dom_point.foot(span.firstChild),
                    $mol_dom_point.foot(div.lastChild),
                    $mol_dom_point.foot(div),
                ]);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
/** @jsx $mol_jsx */
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            "Inside, expand & around"($) {
                const div = $mol_jsx("div", null,
                    "123",
                    $mol_jsx("span", null, "foo"),
                    "456");
                const span = div.childNodes[1];
                $mol_assert_equal($mol_dom_range.inside(span).expand(), $mol_dom_range.around(span));
            },
            "Order range points"($) {
                const div = $mol_jsx("div", null,
                    $mol_jsx("span", null, "one"),
                    $mol_jsx("span", null, "two"));
                const one = $mol_dom_point.head(div.firstChild);
                const two = $mol_dom_point.head(div.lastChild);
                const forward = new $mol_dom_range(one, two);
                const backward = new $mol_dom_range(two, one);
                $mol_assert_equal(forward.ordered(), backward.ordered(), forward);
            },
            "Lift to common block parent"($) {
                const quote = $mol_jsx("blockquote", null,
                    "123",
                    $mol_jsx("p", null,
                        $mol_jsx("span", null, "foo")),
                    $mol_jsx("p", null,
                        $mol_jsx("span", null, "bar")),
                    "456");
                const foo = quote.firstChild.nextSibling;
                const bar = quote.lastChild.previousSibling.firstChild.firstChild;
                const lifted = new $mol_dom_range($mol_dom_point.head(foo), $mol_dom_point.foot(bar)).lifted();
                const ideal = new $mol_dom_range($mol_dom_point.tail(quote.firstChild), $mol_dom_point.nose(quote.lastChild));
                $mol_assert_equal(lifted, ideal);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    function check(str, query) {
        $mol_assert_like(str, $hyoo_harp_to_string(query));
        $mol_assert_like(query, $hyoo_harp_from_string(str));
    }
    $mol_test({
        'root'() {
            check('', {});
        },
        'only field'() {
            check('user%3D777', {
                'user=777': {},
            });
        },
        'primary key'() {
            check('user=jin%2C777!=', {
                user: {
                    '=': [['jin,777!']],
                },
            });
        },
        'single fetch'() {
            check('friend(age%24)', {
                friend: {
                    age$: {},
                },
            });
        },
        'fetch and primary key'() {
            check('user=jin()=(friend)', {
                'user': {
                    '=': [['jin()']],
                    friend: {},
                },
            });
        },
        'multiple fetch'() {
            check('age;friend', {
                age: {},
                friend: {},
            });
        },
        'common query string back compatible'() {
            $mol_assert_like($hyoo_harp_from_string('user=jin&age=100500'), {
                user: {
                    '=': [['jin']],
                },
                age: {
                    '=': [['100500']],
                },
            });
        },
        'common pathname back compatible'() {
            $mol_assert_like($hyoo_harp_from_string('users/jin/comments'), {
                users: {},
                jin: {},
                comments: {},
            });
        },
        'deep fetch'() {
            check('my(friend(age);name);stat', {
                my: {
                    friend: {
                        age: {},
                    },
                    name: {},
                },
                stat: {},
            });
        },
        'orders'() {
            check('+age;-name', {
                age: {
                    '+': true
                },
                name: {
                    '+': false
                },
            });
        },
        'filter types'() {
            check('sex=female=;status!=married=', {
                sex: {
                    '=': [['female']],
                },
                status: {
                    '!=': [['married']],
                },
            });
        },
        'filter ranges'() {
            check('sex=female=;age=18@25=;weight=@50=;height=150@=;hobby=paint=singing=', {
                sex: {
                    '=': [['female']],
                },
                age: {
                    '=': [['18', '25']],
                },
                weight: {
                    '=': [['', '50']],
                },
                height: {
                    '=': [['150', '']],
                },
                hobby: {
                    '=': [['paint'], ['singing']],
                },
            });
        },
        'unescaped values'() {
            $mol_assert_like($hyoo_harp_from_string('foo=jin=777=;bar=jin!=666='), {
                foo: {
                    '=': [['jin'], ['777']],
                },
                bar: {
                    '=': [['jin!'], ['666']],
                },
            });
        },
        'slicing'() {
            check('friend(_num=0@100=)', {
                friend: {
                    _num: { '=': [['0', '100']] },
                },
            });
        },
        'complex'() {
            check('pullRequest(state=closed=merged=;+repository(name;private);-updateTime;_num=0@100=)', {
                pullRequest: {
                    state: {
                        '=': [
                            ['closed'],
                            ['merged'],
                        ]
                    },
                    repository: {
                        '+': true,
                        name: {},
                        private: {},
                    },
                    updateTime: {
                        '+': false,
                    },
                    _num: {
                        '=': [['0', '100']],
                    },
                },
            });
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is string'() {
            $mol_data_string('');
        },
        'Is not string'() {
            $mol_assert_fail(() => {
                $mol_data_string(0);
            }, '0 is not a string');
        },
        'Is object string'() {
            $mol_assert_fail(() => {
                $mol_data_string(new String('x'));
            }, 'x is not a string');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is first'() {
            $mol_data_variant($mol_data_number, $mol_data_string)(0);
        },
        'Is second'() {
            $mol_data_variant($mol_data_number, $mol_data_string)('');
        },
        'Is false'() {
            $mol_assert_fail(() => {
                $mol_data_variant($mol_data_number, $mol_data_string)(false);
            }, 'false is not any of variants');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    const Age = $mol_data_optional($mol_data_number);
    const Age_or_zero = $mol_data_optional($mol_data_number, () => 0);
    $mol_test({
        'Is not present'() {
            $mol_assert_equal(Age(undefined), undefined);
        },
        'Is present'() {
            $mol_assert_equal(Age(0), 0);
        },
        'Fallbacked'() {
            $mol_assert_equal(Age_or_zero(undefined), 0);
        },
        'Is null'() {
            $mol_assert_fail(() => Age(null), 'null is not a number');
        },
    });
})($ || ($ = {}));

;
"use strict";

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Fit to record'() {
            const User = $mol_data_record({ age: $mol_data_number });
            User({ age: 0 });
        },
        'Extends record'() {
            const User = $mol_data_record({ age: $mol_data_number });
            User({ age: 0, name: 'Jin' });
        },
        // 'Recursive record' () {
        // 	const User = $mol_data_record({
        // 		name : $mol_data_string ,
        // 		get kids() { return $mol_data_array( User ) } ,
        // 	})
        // 	User({
        // 		name : 'Jin' ,
        // 		kids : [
        // 			{
        // 				name : 'John' ,
        // 				kids : [] ,
        // 			}
        // 		] ,
        // 	})
        // } ,
        'Shrinks record'() {
            $mol_assert_fail(() => {
                const User = $mol_data_record({ age: $mol_data_number, name: $mol_data_string });
                User({ age: 0 });
            }, '["name"] undefined is not a string');
        },
        'Shrinks deep record'() {
            $mol_assert_fail(() => {
                const User = $mol_data_record({ wife: $mol_data_record({ age: $mol_data_number }) });
                User({ wife: {} });
            }, '["wife"] ["age"] undefined is not a number');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is empty array'() {
            $mol_data_array($mol_data_number)([]);
        },
        'Is array'() {
            $mol_data_array($mol_data_number)([1, 2]);
        },
        'Is not array'() {
            $mol_assert_fail(() => {
                $mol_data_array($mol_data_number)({ [0]: 1, length: 1, map: () => { } });
            }, '[object Object] is not an array');
        },
        'Has wrong item'() {
            $mol_assert_fail(() => {
                $mol_data_array($mol_data_number)([1, '1']);
            }, '[1] 1 is not a number');
        },
        'Has wrong deep item'() {
            $mol_assert_fail(() => {
                $mol_data_array($mol_data_array($mol_data_number))([[], [0, 0, false]]);
            }, '[1] [2] false is not a number');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Is boolean - true'() {
            $mol_data_boolean(true);
        },
        'Is boolean - false'() {
            $mol_data_boolean(false);
        },
        'Is not boolean'() {
            $mol_assert_fail(() => {
                $mol_data_boolean('x');
            }, 'x is not a boolean');
        },
        'Is object boolean'() {
            $mol_assert_fail(() => {
                $mol_data_boolean(new Boolean(''));
            }, 'false is not a boolean');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    /**
     * Checks for value of given enum and returns expected type.
     * @see https://mol.hyoo.ru/#!section=demos/demo=mol_data_enum_demo
     */
    function $mol_data_enum(name, dict) {
        const index = {};
        for (let key in dict) {
            if (Number.isNaN(Number(key))) {
                index[dict[key]] = key;
            }
        }
        return $mol_data_setup((value) => {
            if (typeof index[value] !== 'string') {
                return $mol_fail(new $mol_data_error(`${value} is not value of ${name} enum`));
            }
            return value;
        }, { name, dict });
    }
    $.$mol_data_enum = $mol_data_enum;
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    let sex;
    (function (sex) {
        sex[sex["male"] = 0] = "male";
        sex[sex["female"] = 1] = "female";
    })(sex || (sex = {}));
    let gender;
    (function (gender) {
        gender["bisexual"] = "bisexual";
        gender["trans"] = "transgender";
    })(gender || (gender = {}));
    // Test disabled due https://github.com/microsoft/TypeScript/issues/46112
    // const Sex = $mol_data_enum( 'sex' , sex )
    // type sex_value =  $mol_type_assert< typeof Sex.Value , sex >
    $mol_test({
        'config of enum'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_like(Sex.config, {
                name: 'sex',
                dict: sex,
            });
        },
        'name of enum'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_equal(Sex.config.name, 'sex');
        },
        'Is right value of enum'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_equal(Sex(0), sex.male);
        },
        'Is wrong value of enum'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_fail(() => Sex(2), `2 is not value of sex enum`);
        },
        'Is name instead of value'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_fail(() => Sex('male'), `male is not value of sex enum`);
        },
        'Is common object field'() {
            const Sex = $mol_data_enum('sex', sex);
            $mol_assert_fail(() => Sex('__proto__'), `__proto__ is not value of sex enum`);
        },
    });
    // Test disabled due https://github.com/microsoft/TypeScript/issues/46112
    // type gender_value =  $mol_type_assert< typeof Gender.Value , gender >
    $mol_test({
        'config of enum'() {
            const Gender = $mol_data_enum('gender', gender);
            $mol_assert_like(Gender.config, {
                name: 'gender',
                dict: gender,
            });
        },
        'Is right value of enum'() {
            const Gender = $mol_data_enum('gender', gender);
            $mol_assert_equal(Gender('transgender'), gender.trans);
        },
        'Is wrong value of enum'() {
            const Gender = $mol_data_enum('gender', gender);
            $mol_assert_fail(() => Gender('xxx'), `xxx is not value of gender enum`);
        },
        'Is name instead of value'() {
            const Gender = $mol_data_enum('gender', gender);
            $mol_assert_fail(() => Gender('trans'), `trans is not value of gender enum`);
        },
        'Is common object field'() {
            const Gender = $mol_data_enum('gender', gender);
            $mol_assert_fail(() => Gender('__proto__'), `__proto__ is not value of gender enum`);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'type safe build & parse'() {
            let States;
            (function (States) {
                States["opened"] = "opened";
                States["closed"] = "closed";
            })(States || (States = {}));
            const State = $hyoo_harp_scheme({}, $mol_data_enum('States', States));
            const Str = $hyoo_harp_scheme({}, $mol_data_string);
            const Bool = $hyoo_harp_scheme({}, $mol_data_boolean);
            const Repository = $hyoo_harp_scheme({
                name: $mol_data_optional(Str),
                isPrivate: $mol_data_optional(Bool),
                // pullRequests: PullRequest,
            });
            const PullRequest = $hyoo_harp_scheme({
                state: $mol_data_optional(State),
                updated_at: $mol_data_optional(Str),
                repository: $mol_data_optional(Repository),
            });
            const Request = $hyoo_harp_scheme({
                pullRequest: $mol_data_optional(PullRequest),
            });
            const uri = 'pullRequest(state=closed=;-updated_at;repository(name;isPrivate);_num=0@100=)';
            let query = Request({
                pullRequest: {
                    state: { '=': [[States.closed]] }, // filter
                    updated_at: { '+': false }, // order
                    repository: {
                        name: {},
                        isPrivate: {},
                    },
                    _num: { '=': [[0, 100]] }, // slice
                }
            });
            $mol_assert_like(uri, Request.build(query));
            $mol_assert_like(query, Request.parse(uri));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'save and load buffers'($) {
            const land = $giper_baza_land.make({ $ });
            const file = land.Data($giper_baza_file);
            const source = new Uint8Array(2 ** 15 + 1);
            source[2 ** 15] = 255;
            file.buffer(source);
            $mol_assert_equal(file.chunks().length, 2);
            $mol_assert_equal(file.buffer(), source);
        },
        async 'save and load blobs'($) {
            const land = $giper_baza_land.make({ $ });
            const file = land.Data($giper_baza_file);
            const source = new Uint8Array(2 ** 16 + 1);
            source[2 ** 16 + 1] = 255;
            await $mol_wire_async(file).blob(new $mol_blob([source], { type: 'test/test' }));
            $mol_assert_equal('test/test', file.blob().type);
            $mol_assert_equal(source, new Uint8Array(await file.blob().arrayBuffer()));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Special'() {
            $mol_assert_equal($mol_si_short(0), '0');
            $mol_assert_equal($mol_si_short(1 / 0), '∞');
            $mol_assert_equal($mol_si_short(-1 / 0), '-∞');
            $mol_assert_equal($mol_si_short(0 / 0), '∅');
        },
        'M'() {
            $mol_assert_equal($mol_si_short(0), '0');
            $mol_assert_equal($mol_si_short(0.999500), '1.00');
            $mol_assert_equal($mol_si_short(-0.999600), '-1.00');
            $mol_assert_equal($mol_si_short(999.4), '999');
            $mol_assert_equal($mol_si_short(-999.4), '-999');
        },
        'L'() {
            $mol_assert_equal($mol_si_short(999.5), '1.00k');
            $mol_assert_equal($mol_si_short(-999.5), '-1.00k');
            $mol_assert_equal($mol_si_short(999_400), '999k');
            $mol_assert_equal($mol_si_short(-999_400), '-999k');
        },
        'XL'() {
            $mol_assert_equal($mol_si_short(999_500), '1.00M');
            $mol_assert_equal($mol_si_short(-999_600), '-1.00M');
            $mol_assert_equal($mol_si_short(999_400_000), '999M');
            $mol_assert_equal($mol_si_short(-999_400_000), '-999M');
        },
        'S'() {
            $mol_assert_equal($mol_si_short(0.999400), '999m');
            $mol_assert_equal($mol_si_short(-0.999400), '-999m');
            $mol_assert_equal($mol_si_short(0.000_999_500), '1.00m');
            $mol_assert_equal($mol_si_short(-0.000_999_500), '-1.00m');
        },
        'XS'() {
            $mol_assert_equal($mol_si_short(0.000_999_400), '999µ');
            $mol_assert_equal($mol_si_short(-0.000_999_400), '-999µ');
            $mol_assert_equal($mol_si_short(0.000_000_999_600), '1.00µ');
            $mol_assert_equal($mol_si_short(-0.000_000_999_600), '-1.00µ');
        },
        'With unit'() {
            $mol_assert_equal($mol_si_short(0, 's'), '0 s');
            $mol_assert_equal($mol_si_short(1 / 0, 's'), '∞ s');
            $mol_assert_equal($mol_si_short(0 / 0, 's'), '∅ s');
            $mol_assert_equal($mol_si_short(123, 'Hz'), '123 Hz');
            $mol_assert_equal($mol_si_short(1234, 'g'), '1.23 kg');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'simple sort'() {
            const list = ['abc', 'ac', 'ab'];
            list.sort($mol_compare_text());
            $mol_assert_equal(`${list}`, 'ab,abc,ac');
        },
        'sort ignoring spaces around'() {
            const list = [' a', '\tb', ' b'];
            list.sort($mol_compare_text());
            $mol_assert_equal(`${list}`, ' a,\tb, b');
        },
        'sort ignoring letter case'() {
            const list = ['A', 'B', 'a'];
            list.sort($mol_compare_text());
            $mol_assert_equal(`${list}`, 'A,a,B');
        },
        'sort with custom serializer'() {
            const list = ['abc', 'ab', 'ac'];
            list.sort($mol_compare_text(str => str.split('').reverse().join('')));
            $mol_assert_equal(`${list}`, 'ab,ac,abc');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Числительные склоняются по-русски'() {
            $mol_assert_equal($bog_gram_count.dialogs(1), '1 диалог');
            $mol_assert_equal($bog_gram_count.dialogs(3), '3 диалога');
            $mol_assert_equal($bog_gram_count.dialogs(5), '5 диалогов');
            $mol_assert_equal($bog_gram_count.dialogs(11), '11 диалогов');
            $mol_assert_equal($bog_gram_count.dialogs(21), '21 диалог');
            $mol_assert_equal($bog_gram_count.people(112), '112 участников');
            $mol_assert_equal($bog_gram_count.people(22), '22 участника');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Ожидание заменяется запасным значением, готовое отдаётся как есть'() {
            const wait = new Promise(() => { });
            $mol_assert_equal($bog_gram_soft(() => { throw wait; }, 'запас'), 'запас');
            $mol_assert_equal($bog_gram_soft(() => 'готово', 'запас'), 'готово');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            'Избранное первым, архив и запросы входами по краям, пустой список говорит об этом'($) {
                const empty = $bog_gram_menu.make({ $ });
                $mol_assert_equal(empty.dialog_rows(), [empty.Saved_row(), empty.Dialogs_empty()]);
                const full = $bog_gram_menu.make({ $,
                    visible: () => ['A'],
                    archived: () => ['Z'],
                    requests: () => ['R'],
                });
                $mol_assert_equal(full.dialog_rows(), [full.Archive_row(), full.Saved_row(), full.Dialog_row('A'), full.Requests_row()]);
                full.archive_toggle();
                full.requests_toggle();
                $mol_assert_equal(full.dialog_rows(), [
                    full.Archive_row(), full.Dialog_row('Z'),
                    full.Saved_row(), full.Dialog_row('A'),
                    full.Requests_row(), full.Dialog_row('R'),
                ]);
            },
            'Корзина удаляет со второго нажатия, другой клик снимает взвод'($) {
                const dropped = [];
                const menu = $bog_gram_menu.make({ $, drop: (id) => { dropped.push(id); return null; } });
                menu.delete_click('A');
                $mol_assert_equal(menu.delete_armed('A'), true);
                $mol_assert_equal(menu.delete_hint('A'), 'Точно удалить?');
                menu.archive_toggle();
                $mol_assert_equal(menu.delete_armed('A'), false);
                menu.delete_click('A');
                menu.delete_click('A');
                $mol_assert_equal(dropped, ['A']);
            },
            'В строке запроса вместо архива и корзины согласие и отказ'($) {
                const menu = $bog_gram_menu.make({ $, request_is: (id) => id === 'R' });
                $mol_assert_equal(menu.Dialog_archive('R'), menu.Request_accept('R'));
                $mol_assert_equal(menu.Dialog_delete('R'), menu.Request_reject('R'));
                $mol_assert_equal(menu.Dialog_archive('A') === menu.Request_accept('A'), false);
            },
            'Непрочитанное в архиве складывается'($) {
                const menu = $bog_gram_menu.make({ $,
                    archived: () => ['X', 'Y'],
                    unread: (id) => id === 'X' ? 2 : 3,
                });
                $mol_assert_equal(menu.archive_unread_label(), '5');
                $mol_assert_equal(menu.archive_note(), '2 диалога');
            },
            'Открыта одна строка, тап по списку закрывает её вместо перехода'($) {
                const picked = [];
                const menu = $bog_gram_menu.make({ $, select: (id) => { picked.push(id); return null; } });
                menu.Dialog_row('A').swipe_open(true);
                menu.Dialog_row('B').swipe_open(true);
                $mol_assert_equal(menu.Dialog_row('A').swipe_open(), false);
                $mol_assert_equal(menu.Dialog_row('B').swipe_open(), true);
                menu.pick('A');
                $mol_assert_equal(menu.Dialog_row('B').swipe_open(), false);
                $mol_assert_equal(picked, []);
                menu.pick('A');
                $mol_assert_equal(picked, ['A']);
            },
            'Esc и клик мимо закрывают открытую строку, клик по ней самой — нет'($) {
                const menu = $bog_gram_menu.make({ $ });
                const row = menu.Dialog_row('A');
                row.dom_tree();
                row.swipe_open(true);
                menu.swipe_outside({ target: row.Info().dom_node() });
                $mol_assert_equal(row.swipe_open(), true);
                menu.swipe_outside({ target: menu.Head().dom_node() });
                $mol_assert_equal(row.swipe_open(), false);
                row.swipe_open(true);
                menu.swipe_key({ key: 'Enter' });
                $mol_assert_equal(row.swipe_open(), true);
                menu.swipe_key({ key: 'Escape' });
                $mol_assert_equal(row.swipe_open(), false);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Из ссылки Gram берутся только свои параметры'() {
            const lord = 'AAAAAAAA_BBBBBBBB';
            $mol_assert_equal($bog_gram_follow.params('https://b-on-g.github.io/gram/#!invite=' + lord + '/key=abc%2Fdef'), { invite: lord, key: 'abc/def' });
            $mol_assert_equal($bog_gram_follow.params('https://b-on-g.github.io/gram/#!join=' + lord + '/by=CCCCCCCC_DDDDDDDD'), { join: lord, by: 'CCCCCCCC_DDDDDDDD' });
            $mol_assert_equal($bog_gram_follow.params('https://b-on-g.github.io/gram/#!users=' + lord + '/giper_baza_yard_masters=https%3A%2F%2Fevil'), { users: lord });
        },
        'Чужой QR и мусор ничего не открывают'() {
            $mol_assert_equal($bog_gram_follow.params('https://example.com/'), {});
            $mol_assert_equal($bog_gram_follow.params('просто текст'), {});
            $mol_assert_equal($bog_gram_follow.params('https://x/#!key=only'), {});
            $mol_assert_equal($bog_gram_follow.params('https://x/#!invite=%E0%A4%A'), {});
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Ключ из QR встаёт в поле входа, чужой QR даёт ошибку'($) {
            const auth = await $.$giper_baza_auth._generate();
            const key = auth.toString() + auth.toStringPrivate();
            const block = $bog_gram_settings_key.make({ $ });
            block.armed(true);
            block.Scan().found(key);
            $mol_assert_equal(block.input(), key);
            $mol_assert_equal(block.error(), '');
            $mol_assert_equal(block.armed(), false);
            block.Scan().found('https://example.org/');
            $mol_assert_equal(block.input(), 'https://example.org/');
            $mol_assert_equal(block.error(), 'В QR не ключ аккаунта');
        },
        'Вход по ключу взводится первым нажатием, мусор до взвода не доходит'($) {
            const block = $bog_gram_settings_key.make({ $ });
            block.import();
            $mol_assert_equal(block.error(), 'Вставьте ключ или загрузите файл');
            block.input('не ключ');
            block.import();
            $mol_assert_equal(block.error(), 'Это не похоже на ключ аккаунта');
            $mol_assert_equal(block.armed(), false);
        },
        'Пока ключ скрыт, его нет ни в тексте, ни в коде'($) {
            const block = $bog_gram_settings_key.make({ $ });
            $mol_assert_equal(block.rows().includes(block.Row()), false);
            $mol_assert_equal(block.rows().includes(block.Qr_box()), false);
            block.toggle();
            $mol_assert_equal(block.rows().includes(block.Row()), true);
            $mol_assert_equal(block.toggle_label(), 'Скрыть ключ');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            'Вставленная ссылка открывается, чужая — объясняется'($) {
                const lord = 'AAAAAAAA_BBBBBBBB';
                const opened = [];
                let closed = 0;
                const context = $.$mol_ambient({
                    $bog_gram_follow: class extends $.$bog_gram_follow {
                        static go(uri) {
                            const params = this.params(uri);
                            if (!Object.keys(params).length)
                                return false;
                            opened.push(params);
                            return true;
                        }
                    },
                });
                const page = $bog_gram_settings.make({ $: context });
                page.close = () => (++closed, null);
                page.paste_uri('https://example.com/#!x=1');
                page.paste_open();
                $mol_assert_equal(closed, 0);
                $mol_assert_equal(opened, []);
                $mol_assert_equal(page.paste_uri(), 'https://example.com/#!x=1');
                $mol_assert_equal(page.paste_error() !== '', true);
                page.paste_uri(' https://b-on-g.github.io/gram/#!invite=' + lord + '/key=abc%2Fdef ');
                $mol_assert_equal(page.paste_error(), '');
                page.paste_open();
                $mol_assert_equal(closed, 1);
                $mol_assert_equal(opened, [{ invite: lord, key: 'abc/def' }]);
                $mol_assert_equal(page.paste_uri(), '');
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Своя подпись важнее имени, без обоих — сокращённый идентификатор'() {
            const peer = 'LordPeerWithVeryLongIdentifier';
            $mol_assert_equal($bog_gram_lord.label(peer, 'Костя с работы', 'Иииии'), 'Костя с работы');
            $mol_assert_equal($bog_gram_lord.label(peer, '', 'Иииии'), 'Иииии');
            $mol_assert_equal($bog_gram_lord.label(peer, '', ''), 'LordPe…fier');
            $mol_assert_equal($bog_gram_lord.label('', 'Костя с работы', 'Иииии'), '');
        },
        'Лордом считается только полный идентификатор владельца'() {
            $mol_assert_equal($bog_gram_lord.check('ikjOnflc_WufmHhGH'), true);
            $mol_assert_equal($bog_gram_lord.check('не ссылка'), false);
            $mol_assert_equal($bog_gram_lord.check('ikjOnflc_Wufm'), false);
            $mol_assert_equal($bog_gram_lord.check('ikjOnflc_WufmHhGH_Aaaaaaaa'), false);
        },
        'Один лорд всегда красится одинаково'() {
            $mol_assert_equal($bog_gram_lord.tint('LordA'), $bog_gram_lord.tint('LordA'));
            $mol_assert_equal($bog_gram_lord.tint('LordA') < 7, true);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Набранный ID и выбранный человек открывают диалог, поле очищается'($) {
            const opened = [];
            const compose = $bog_gram_compose.make({ $, open: (lord) => { opened.push(lord); return null; } });
            compose.start();
            $mol_assert_equal(opened, []);
            compose.peer('  LordPeer_Aaaaaaaa  ');
            compose.start();
            compose.pick('LordUser_Bbbbbbbb');
            $mol_assert_equal(opened, ['LordPeer_Aaaaaaaa', 'LordUser_Bbbbbbbb']);
            $mol_assert_equal(compose.peer(), '');
        },
        'Без людей список объясняет, откуда их взять'($) {
            const lonely = $bog_gram_compose.make({ $, users: () => [], registry_ids: () => [] });
            $mol_assert_equal(lonely.user_rows(), [lonely.Users_empty()]);
            $mol_assert_equal(lonely.users_empty_text(), 'Вы не состоите ни в одном реестре. Создайте свой в настройках');
            const alone = $bog_gram_compose.make({ $, users: () => [], registry_ids: () => ['Registry'] });
            $mol_assert_equal(alone.users_empty_text(), 'Кроме вас в реестрах пока никого нет');
            const crowd = $bog_gram_compose.make({ $, users: () => ['LordA', 'LordB'] });
            $mol_assert_equal(crowd.user_rows().length, 2);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Выбранные отмечаются в списке и называются числом'($) {
            const group = $bog_gram_group.make({ $,
                contact_lords: () => ['LordA', 'LordB'],
                picked: () => ['LordB'],
            });
            $mol_assert_equal(group.pick_rows().length, 2);
            $mol_assert_equal(group.Pick_mark('LordA'), null);
            $mol_assert_equal(group.Pick_mark('LordB') === null, false);
            $mol_assert_equal(group.chosen_rows().length, 1);
            $mol_assert_equal(group.chosen_head(), '1 участник');
            const empty = $bog_gram_group.make({ $ });
            $mol_assert_equal(empty.chosen_head(), 'Пока никого не выбрали');
        },
        'Потерянные ключи называются по именам, а кнопка создаёт без них'($) {
            const group = $bog_gram_group.make({ $,
                lost: () => ['LordA'],
                label: (lord) => lord === 'LordA' ? 'Аня' : lord,
            });
            $mol_assert_equal(group.lost_note().startsWith('Не нашли ключей: Аня.'), true);
            $mol_assert_equal(group.make_label(), 'Создать без них');
            const clean = $bog_gram_group.make({ $ });
            $mol_assert_equal(clean.Lost_note(), null);
            $mol_assert_equal(clean.make_label(), 'Создать группу');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Звать людей может только админ, назначать админов только создатель'($) {
            const plain = $bog_gram_members.make({ $, me: () => 'Me', lords: () => ['Me', 'Ann'] });
            $mol_assert_equal(plain.add_rows(), []);
            $mol_assert_equal(plain.Rule('Ann'), null);
            $mol_assert_equal(plain.Drop('Ann'), null);
            $mol_assert_equal(plain.Drop_note(), null);
            const admin = $bog_gram_members.make({ $, me: () => 'Me', admin: () => true });
            $mol_assert_equal(admin.add_rows().includes(admin.Admin_note()), false);
            $mol_assert_equal(admin.Rule('Ann'), null);
            $mol_assert_equal(admin.Drop('Me'), null);
            $mol_assert_equal(admin.Drop('Ann') === null, false);
            const owner = $bog_gram_members.make({ $, me: () => 'Me', admin: () => true, owner: () => true, admin_is: (lord) => lord === 'Bob' });
            $mol_assert_equal(owner.add_rows().includes(owner.Admin_note()), true);
            $mol_assert_equal(owner.Rule('Ann') === null, false);
            $mol_assert_equal(owner.Rule('Bob'), null);
            $mol_assert_equal(owner.member_title('Me'), 'Вы');
        },
        'Убрать участника можно только вторым нажатием'($) {
            const parted = [];
            const members = $bog_gram_members.make({ $,
                lords: () => ['Ann', 'Bob'],
                part: (lord) => { parted.push(lord); return null; },
            });
            members.drop_click('Ann');
            $mol_assert_equal(members.armed('Ann'), true);
            $mol_assert_equal(members.drop_hint('Ann'), 'Точно убрать? Прошлые сообщения у него останутся');
            members.drop_click('Bob');
            $mol_assert_equal(members.armed('Ann'), false);
            $mol_assert_equal(parted, []);
            members.drop_click('Bob');
            $mol_assert_equal(parted, ['Bob']);
        },
        'Набранный ID проверяется до добавления'($) {
            const added = [];
            const members = $bog_gram_members.make({ $,
                me: () => 'ikjOnflc_WufmHhGH',
                add: (lord) => { added.push(lord); return null; },
            });
            members.id('ikjOnflc_WufmHhGH');
            members.id_add();
            $mol_assert_equal(members.error(), 'Это ваш собственный идентификатор');
            members.id('мусор');
            members.id_add();
            $mol_assert_equal(members.error(), 'Это не похоже на идентификатор');
            members.id('AAAAAAAA_BBBBBBBB');
            members.id_add();
            $mol_assert_equal(members.error(), '');
            $mol_assert_equal(added, ['AAAAAAAA_BBBBBBBB']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Имя и ссылка на лобби пишутся и читаются'($) {
            const land = $giper_baza_land.make({ $ });
            const user = land.Data($bog_gram_user);
            user.Name('auto')?.val('Алиса');
            user.Inbox_land('auto')?.val('InboxLink1');
            $mol_assert_equal(user.Name().val(), 'Алиса');
            $mol_assert_equal(user.Inbox_land().val(), 'InboxLink1');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Чужой пользователь доставляет приглашение в открытое лобби владельца'($) {
            const owner = await $.$giper_baza_auth._generate();
            const stranger = await $.$giper_baza_auth._generate();
            const inbox0 = $giper_baza_land.make({ $, auth: () => owner });
            inbox0.give(null, $giper_baza_rank_post('just'));
            const inbox_stranger = $giper_baza_land.make({ $, link: () => inbox0.link(), auth: () => stranger });
            await $mol_wire_async(inbox_stranger).units_steal(inbox0);
            inbox_stranger.Data($bog_gram_inbox).Invites('auto').add('NewDialogLink');
            await $mol_wire_async(inbox0).units_steal(inbox_stranger);
            const invites = inbox0.Data($bog_gram_inbox).Invites().items();
            $mol_assert_equal(invites.includes('NewDialogLink'), true);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Ключ принимается только под своим лордом'($) {
            const auth_a = await $.$giper_baza_auth._generate();
            const auth_b = await $.$giper_baza_auth._generate();
            const lord_a = auth_a.pass().lord().str;
            const lord_b = auth_b.pass().lord().str;
            $mol_assert_equal($bog_gram_pass.verified(lord_a, auth_a.pass().toString())?.lord().str, lord_a);
            $mol_assert_equal($bog_gram_pass.verified(lord_a, auth_b.pass().toString()), null);
            $mol_assert_equal($bog_gram_pass.verified(lord_b, auth_a.pass().toString()), null);
        },
        async 'Мусор вместо ключа не роняет разбор'($) {
            const auth = await $.$giper_baza_auth._generate();
            const lord = auth.pass().lord().str;
            $mol_assert_equal($bog_gram_pass.verified(lord, 'не ключ'), null);
            $mol_assert_equal($bog_gram_pass.verified(lord, 'a'.repeat(43)), null);
            $mol_assert_equal($bog_gram_pass.verified(lord, 'a'.repeat(86)), null);
            $mol_assert_equal($bog_gram_pass.verified(lord, ''), null);
            $mol_assert_equal($bog_gram_pass.verified('', auth.pass().toString()), null);
        },
        async 'Одна строка ключа даёт один и тот же объект'($) {
            const auth = await $.$giper_baza_auth._generate();
            const str = auth.pass().toString();
            $mol_assert_equal($bog_gram_pass.parse(str), $bog_gram_pass.parse(str));
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function message_of(land, link) {
        return land.Pawn($bog_gram_message).Head(link.head());
    }
    async function pair($) {
        const king = await $.$giper_baza_auth._generate();
        const auth_a = await $.$giper_baza_auth._generate();
        const auth_b = await $.$giper_baza_auth._generate();
        const session0 = $giper_baza_land.make({ $, auth: () => king });
        session0.give(auth_a.pass(), $giper_baza_rank_rule);
        session0.give(auth_b.pass(), $giper_baza_rank_post('just'));
        const session_a = $giper_baza_land.make({ $, link: () => session0.link(), auth: () => auth_a });
        await $mol_wire_async(session_a).units_steal(session0);
        const session_b = $giper_baza_land.make({ $, link: () => session0.link(), auth: () => auth_b });
        return { auth_a, lord_a: auth_a.pass().lord().str, session_a, session_b };
    }
    $mol_test({
        async 'Правка синхронизируется вместе с меткой Edited'($) {
            const { lord_a, session_a, session_b } = await pair($);
            const msg_a = session_a.Data($bog_gram_session).Messages('auto').make(null);
            msg_a.Text('auto')?.val('первая редакция');
            msg_a.Author('auto')?.val(lord_a);
            msg_a.Moment('auto')?.val(1000);
            await $mol_wire_async(session_b).units_steal(session_a);
            const links_b = session_b.Data($bog_gram_session).Messages().items();
            $mol_assert_equal(links_b.length, 1);
            $mol_assert_equal(message_of(session_b, links_b[0]).Text().val(), 'первая редакция');
            $mol_assert_equal(message_of(session_b, links_b[0]).Edited()?.val() ?? null, null);
            msg_a.Text('auto')?.val('вторая редакция');
            msg_a.Edited('auto')?.val(1500);
            await $mol_wire_async(session_b).units_steal(session_a);
            const edited_b = message_of(session_b, links_b[0]);
            $mol_assert_equal(edited_b.Text().val(), 'вторая редакция');
            $mol_assert_equal(edited_b.Edited().val(), 1500);
        },
        async 'Удаление — метка Deleted, сообщение остаётся в списке у обеих сторон'($) {
            const { lord_a, session_a, session_b } = await pair($);
            const data_a = session_a.Data($bog_gram_session);
            const alive_a = data_a.Messages('auto').make(null);
            alive_a.Text('auto')?.val('доживёт');
            alive_a.Author('auto')?.val(lord_a);
            alive_a.Moment('auto')?.val(1000);
            const dead_a = data_a.Messages('auto').make(null);
            dead_a.Text('auto')?.val('сотрут');
            dead_a.Author('auto')?.val(lord_a);
            dead_a.Moment('auto')?.val(2000);
            dead_a.Deleted('auto')?.val(2500);
            await $mol_wire_async(session_b).units_steal(session_a);
            const links_b = session_b.Data($bog_gram_session).Messages().items();
            $mol_assert_equal(links_b.length, 2);
            const pawns_b = links_b.map(link => message_of(session_b, link));
            const alive_b = pawns_b.filter(message => !message.Deleted()?.val());
            const dead_b = pawns_b.filter(message => message.Deleted()?.val());
            $mol_assert_equal(alive_b.length, 1);
            $mol_assert_equal(alive_b[0].Text().val(), 'доживёт');
            $mol_assert_equal(dead_b.length, 1);
            $mol_assert_equal(dead_b[0].Text().val(), 'сотрут');
            $mol_assert_equal(dead_b[0].Deleted().val(), 2500);
        },
        async 'Ссылка на кадр и его размеры доезжают до собеседника без самого кадра'($) {
            const { auth_a, lord_a, session_a, session_b } = await pair($);
            const shot_land = $giper_baza_land.make({ $, auth: () => auth_a });
            const shot = shot_land.Data($giper_baza_file);
            shot.buffer(new Uint8Array([1, 2, 3, 4]));
            shot.type('image/webp');
            const msg_a = session_a.Data($bog_gram_session).Messages('auto').make(null);
            msg_a.Author('auto')?.val(lord_a);
            msg_a.Moment('auto')?.val(1000);
            msg_a.Image('auto').remote(shot);
            msg_a.Image_width('auto')?.val(1200);
            msg_a.Image_height('auto')?.val(900);
            await $mol_wire_async(session_b).units_steal(session_a);
            const links_b = session_b.Data($bog_gram_session).Messages().items();
            $mol_assert_equal(links_b.length, 1);
            const got = message_of(session_b, links_b[0]);
            $mol_assert_equal(got.Image().val().str, shot.link().str);
            $mol_assert_equal(got.Image_width().val(), 1200);
            $mol_assert_equal(got.Image_height().val(), 900);
        },
        async 'Кадр без подписи остаётся живым сообщением, подпись дописывается правкой'($) {
            const land = $giper_baza_land.make({ $ });
            const session = land.Data($bog_gram_session);
            const shot_land = $giper_baza_land.make({ $ });
            const shot = shot_land.Data($giper_baza_file);
            shot.buffer(new Uint8Array([7, 7, 7]));
            shot.type('image/webp');
            const message = session.Messages('auto').make(null);
            message.Author('auto')?.val('LordMine');
            message.Moment('auto')?.val(1000);
            message.Image('auto').remote(shot);
            message.Image_width('auto')?.val(800);
            message.Image_height('auto')?.val(600);
            const links = session.Messages().items();
            const found = message_of(land, links[0]);
            $mol_assert_equal(found.Text()?.val() ?? '', '');
            $mol_assert_equal(found.Deleted()?.val() ?? null, null);
            $mol_assert_equal(found.Image().val().str, shot.link().str);
            $mol_assert_equal(found.Image_width().val(), 800);
            $mol_assert_equal(found.Image_height().val(), 600);
            found.Text('auto')?.val('Вид с балкона');
            found.Edited('auto')?.val(1500);
            $mol_assert_equal(message_of(land, links[0]).Text().val(), 'Вид с балкона');
            $mol_assert_equal(message_of(land, links[0]).Image().val().str, shot.link().str);
        },
        async 'Ссылка на запись и её длительность доезжают до собеседника без самой записи'($) {
            const { auth_a, lord_a, session_a, session_b } = await pair($);
            const sound_land = $giper_baza_land.make({ $, auth: () => auth_a });
            const sound = sound_land.Data($giper_baza_file);
            sound.buffer(new Uint8Array([9, 8, 7, 6]));
            sound.type('audio/webm');
            const msg_a = session_a.Data($bog_gram_session).Messages('auto').make(null);
            msg_a.Author('auto')?.val(lord_a);
            msg_a.Moment('auto')?.val(1000);
            msg_a.Voice('auto').remote(sound);
            msg_a.Voice_span('auto')?.val(7.5);
            await $mol_wire_async(session_b).units_steal(session_a);
            const links_b = session_b.Data($bog_gram_session).Messages().items();
            $mol_assert_equal(links_b.length, 1);
            const got = message_of(session_b, links_b[0]);
            $mol_assert_equal(got.Voice().val().str, sound.link().str);
            $mol_assert_equal(got.Voice_span().val(), 7.5);
            $mol_assert_equal(got.Text()?.val() ?? '', '');
            $mol_assert_equal(got.Image()?.val() ?? null, null);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    async function pair($) {
        const king = await $.$giper_baza_auth._generate();
        const auth_a = await $.$giper_baza_auth._generate();
        const auth_b = await $.$giper_baza_auth._generate();
        const session0 = $giper_baza_land.make({ $, auth: () => king });
        session0.give(auth_a.pass(), $giper_baza_rank_rule);
        session0.give(auth_b.pass(), $giper_baza_rank_post('just'));
        const session_a = $giper_baza_land.make({ $, link: () => session0.link(), auth: () => auth_a });
        await $mol_wire_async(session_a).units_steal(session0);
        const session_b = $giper_baza_land.make({ $, link: () => session0.link(), auth: () => auth_b });
        await $mol_wire_async(session_b).units_steal(session0);
        return {
            lord_a: auth_a.pass().lord().str,
            lord_b: auth_b.pass().lord().str,
            reads_a: () => session_a.Data($bog_gram_session),
            reads_b: () => session_b.Data($bog_gram_session),
            session_a,
            session_b,
        };
    }
    $mol_test({
        async 'Отметки участников лежат по ключу-лорду и мержатся без конфликтов'($) {
            const { lord_a, lord_b, reads_a, reads_b, session_a, session_b } = await pair($);
            reads_a().Reads('auto')?.key(lord_a, 'auto')?.Moment('auto')?.val(1000);
            reads_b().Reads('auto')?.key(lord_b, 'auto')?.Moment('auto')?.val(2000);
            await $mol_wire_async(session_a).units_steal(session_b);
            await $mol_wire_async(session_b).units_steal(session_a);
            $mol_assert_equal(reads_a().Reads()?.key(lord_a)?.Moment()?.val(), 1000);
            $mol_assert_equal(reads_a().Reads()?.key(lord_b)?.Moment()?.val(), 2000);
            $mol_assert_equal(reads_b().Reads()?.key(lord_a)?.Moment()?.val(), 1000);
            $mol_assert_equal(reads_b().Reads()?.key(lord_b)?.Moment()?.val(), 2000);
        },
        async 'Сдвинутая вперёд отметка доезжает до собеседника'($) {
            const { lord_a, reads_a, reads_b, session_a, session_b } = await pair($);
            reads_a().Reads('auto')?.key(lord_a, 'auto')?.Moment('auto')?.val(1000);
            await $mol_wire_async(session_b).units_steal(session_a);
            $mol_assert_equal(reads_b().Reads()?.key(lord_a)?.Moment()?.val(), 1000);
            reads_a().Reads('auto')?.key(lord_a, 'auto')?.Moment('auto')?.val(3000);
            await $mol_wire_async(session_b).units_steal(session_a);
            $mol_assert_equal(reads_a().Reads()?.key(lord_a)?.Moment()?.val(), 3000);
            $mol_assert_equal(reads_b().Reads()?.key(lord_a)?.Moment()?.val(), 3000);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Участники и сессии пишутся и читаются'($) {
            const land = $giper_baza_land.make({ $ });
            const dialog = land.Data($bog_gram_dialog);
            dialog.Peers('auto').add('LordA');
            dialog.Peers('auto').add('LordB');
            dialog.Sessions('auto').add('SessionLink1');
            $mol_assert_equal(dialog.Peers().items().length, 2);
            $mol_assert_equal(dialog.Sessions().items()[0], 'SessionLink1');
        },
        async 'Участник с выданным правом читает и пишет шифрованный ленд диалога'($) {
            const king = await $.$giper_baza_auth._generate();
            const auth_b = await $.$giper_baza_auth._generate();
            const land0 = $giper_baza_land.make({ $, auth: () => king });
            await $mol_wire_async(land0).encrypted(true);
            $mol_assert_equal(land0.encrypted(), true);
            const land_b = $giper_baza_land.make({ $, link: () => land0.link(), auth: () => auth_b });
            const ops = {
                king_writes() {
                    land0.give(auth_b.pass(), $giper_baza_rank_post('just'));
                    land0.Data($bog_gram_dialog).Peers('auto').add('SecretLordA');
                    return true;
                },
                b_reads() {
                    return land_b.Data($bog_gram_dialog).Peers().items().slice();
                },
                b_writes() {
                    land_b.Data($bog_gram_dialog).Peers('auto').add('SecretLordB');
                    return true;
                },
                king_reads() {
                    return land0.Data($bog_gram_dialog).Peers().items().slice();
                },
            };
            await $mol_wire_async(ops).king_writes();
            await $mol_wire_async(land_b).units_steal(land0);
            const peers_b = await $mol_wire_async(ops).b_reads();
            $mol_assert_equal(peers_b.includes('SecretLordA'), true);
            await $mol_wire_async(ops).b_writes();
            await $mol_wire_async(land0).units_steal(land_b);
            const peers0 = await $mol_wire_async(ops).king_reads();
            $mol_assert_equal(peers0.includes('SecretLordB'), true);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function message_of(land, link) {
        return land.Pawn($bog_gram_message).Head(link.head());
    }
    $mol_test({
        async 'Сообщение пишется в сессию и читается из неё'($) {
            const land = $giper_baza_land.make({ $ });
            const session = land.Data($bog_gram_session);
            const message = session.Messages('auto').make(null);
            message.Text('auto')?.val('Привет!');
            message.Author('auto')?.val('LordA');
            message.Moment('auto')?.val(1000);
            const links = session.Messages().items();
            $mol_assert_equal(links.length, 1);
            const found = message_of(land, links[0]);
            $mol_assert_equal(found.Text().val(), 'Привет!');
            $mol_assert_equal(found.Author().val(), 'LordA');
        },
        async 'Два участника обмениваются сообщениями через синк сессии'($) {
            const king_dialog = await $.$giper_baza_auth._generate();
            const king_session = await $.$giper_baza_auth._generate();
            const auth_a = await $.$giper_baza_auth._generate();
            const auth_b = await $.$giper_baza_auth._generate();
            const lord_a = auth_a.pass().lord().str;
            const lord_b = auth_b.pass().lord().str;
            const dialog0 = $giper_baza_land.make({ $, auth: () => king_dialog });
            dialog0.give(auth_a.pass(), $giper_baza_rank_rule);
            dialog0.give(auth_b.pass(), $giper_baza_rank_post('just'));
            const session0 = $giper_baza_land.make({ $, auth: () => king_session });
            session0.give(auth_a.pass(), $giper_baza_rank_rule);
            session0.give(auth_b.pass(), $giper_baza_rank_post('just'));
            const dialog_a = $giper_baza_land.make({ $, link: () => dialog0.link(), auth: () => auth_a });
            await $mol_wire_async(dialog_a).units_steal(dialog0);
            const session_a = $giper_baza_land.make({ $, link: () => session0.link(), auth: () => auth_a });
            await $mol_wire_async(session_a).units_steal(session0);
            const dialog_data_a = dialog_a.Data($bog_gram_dialog);
            dialog_data_a.Peers('auto').add(lord_a);
            dialog_data_a.Peers('auto').add(lord_b);
            dialog_data_a.Sessions('auto').add(session0.link().str);
            const msg_a = session_a.Data($bog_gram_session).Messages('auto').make(null);
            msg_a.Text('auto')?.val('Привет, B!');
            msg_a.Author('auto')?.val(lord_a);
            msg_a.Moment('auto')?.val(1000);
            const dialog_b = $giper_baza_land.make({ $, link: () => dialog0.link(), auth: () => auth_b });
            await $mol_wire_async(dialog_b).units_steal(dialog_a);
            const session_b = $giper_baza_land.make({ $, link: () => session0.link(), auth: () => auth_b });
            await $mol_wire_async(session_b).units_steal(session_a);
            const peers_b = dialog_b.Data($bog_gram_dialog).Peers().items();
            $mol_assert_equal(peers_b.includes(lord_a), true);
            $mol_assert_equal(peers_b.includes(lord_b), true);
            const links_b = session_b.Data($bog_gram_session).Messages().items();
            $mol_assert_equal(links_b.length, 1);
            $mol_assert_equal(message_of(session_b, links_b[0]).Text().val(), 'Привет, B!');
            const msg_b = session_b.Data($bog_gram_session).Messages('auto').make(null);
            msg_b.Text('auto')?.val('Привет, A!');
            msg_b.Author('auto')?.val(lord_b);
            msg_b.Moment('auto')?.val(2000);
            await $mol_wire_async(session_a).units_steal(session_b);
            const links_a = session_a.Data($bog_gram_session).Messages().items();
            $mol_assert_equal(links_a.length, 2);
            const sorted = links_a
                .map(link => message_of(session_a, link))
                .sort((x, y) => (x.Moment()?.val() ?? 0) - (y.Moment()?.val() ?? 0));
            $mol_assert_equal(sorted[0].Author().val(), lord_a);
            $mol_assert_equal(sorted[1].Author().val(), lord_b);
            $mol_assert_equal(sorted[1].Text().val(), 'Привет, A!');
        },
        async 'Каждое сообщение хранит свой Moment независимо от места в списке'($) {
            const land = $giper_baza_land.make({ $ });
            const session = land.Data($bog_gram_session);
            const moments = [3000, 1000, 2000];
            const texts = ['третье', 'первое', 'второе'];
            for (let i = 0; i < moments.length; ++i) {
                const message = session.Messages('auto').make(null);
                message.Text('auto')?.val(texts[i]);
                message.Moment('auto')?.val(moments[i]);
            }
            const links = session.Messages().items();
            const sorted = links
                .map(link => message_of(land, link))
                .sort((x, y) => (x.Moment()?.val() ?? 0) - (y.Moment()?.val() ?? 0));
            $mol_assert_equal(sorted[0].Text().val(), 'первое');
            $mol_assert_equal(sorted[1].Text().val(), 'второе');
            $mol_assert_equal(sorted[2].Text().val(), 'третье');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function strings(list) {
        return (list?.items() ?? []).map(String);
    }
    async function open_registry($) {
        const king = await $.$giper_baza_auth._generate();
        const registry0 = $giper_baza_land.make({ $, auth: () => king });
        registry0.give(null, $giper_baza_rank_post('just'));
        return { king, registry0 };
    }
    async function copy($, of, auth) {
        const land = $giper_baza_land.make({ $, link: () => of.link(), auth: () => auth });
        await $mol_wire_async(land).units_steal(of);
        return land;
    }
    $mol_test({
        async 'Конкурентная регистрация мержится без конфликтов'($) {
            const { registry0 } = await open_registry($);
            const auth_a = await $.$giper_baza_auth._generate();
            const auth_b = await $.$giper_baza_auth._generate();
            const registry_a = await copy($, registry0, auth_a);
            const registry_b = await copy($, registry0, auth_b);
            registry_a.Data($bog_gram_users).Lords('auto').add(auth_a.pass().lord().str);
            registry_b.Data($bog_gram_users).Lords('auto').add(auth_b.pass().lord().str);
            await $mol_wire_async(registry_a).units_steal(registry_b);
            await $mol_wire_async(registry_b).units_steal(registry_a);
            const lords_a = strings(registry_a.Data($bog_gram_users).Lords());
            const lords_b = strings(registry_b.Data($bog_gram_users).Lords());
            $mol_assert_equal(lords_a.includes(auth_a.pass().lord().str), true);
            $mol_assert_equal(lords_a.includes(auth_b.pass().lord().str), true);
            $mol_assert_equal(lords_a.length, lords_b.length);
        },
        async 'Вступление — явная запись, чтение список не меняет'($) {
            const { registry0 } = await open_registry($);
            const guest = await $.$giper_baza_auth._generate();
            const guest_lord = guest.pass().lord().str;
            const registry_guest = await copy($, registry0, guest);
            $mol_assert_equal(strings(registry_guest.Data($bog_gram_users).Lords()).length, 0);
            registry_guest.Data($bog_gram_users).Lords('auto').add(guest_lord);
            $mol_assert_equal(strings(registry_guest.Data($bog_gram_users).Lords()).includes(guest_lord), true);
            await $mol_wire_async(registry0).units_steal(registry_guest);
            $mol_assert_equal(strings(registry0.Data($bog_gram_users).Lords()).includes(guest_lord), true);
        },
        async 'Название задаёт создатель, видит участник'($) {
            const { king, registry0 } = await open_registry($);
            const guest = await $.$giper_baza_auth._generate();
            const king_lord = king.pass().lord().str;
            const data0 = registry0.Data($bog_gram_users);
            data0.Title('auto')?.val('Соседи по даче');
            data0.Lords('auto').add(king_lord);
            const data_guest = (await copy($, registry0, guest)).Data($bog_gram_users);
            $mol_assert_equal(data_guest.Title().val(), 'Соседи по даче');
            $mol_assert_equal(strings(data_guest.Lords()).includes(king_lord), true);
        },
        async 'Ключ участника доезжает до других и лежит по ключу-лорду'($) {
            const { registry0 } = await open_registry($);
            const auth_a = await $.$giper_baza_auth._generate();
            const auth_b = await $.$giper_baza_auth._generate();
            const lord_a = auth_a.pass().lord().str;
            const key_a = auth_a.pass().toString();
            const registry_a = await copy($, registry0, auth_a);
            const data_a = registry_a.Data($bog_gram_users);
            data_a.Lords('auto').add(lord_a);
            data_a.Keys('auto')?.key(lord_a, 'auto')?.Pass('auto')?.val(key_a);
            const data_b = (await copy($, registry_a, auth_b)).Data($bog_gram_users);
            $mol_assert_equal(strings(data_b.Lords()).includes(lord_a), true);
            const got = String(data_b.Keys()?.key(lord_a)?.Pass()?.val() ?? '');
            $mol_assert_equal(got, key_a);
            $mol_assert_equal($bog_gram_pass.verified(lord_a, got)?.lord().str, lord_a);
            $mol_assert_equal(Boolean(data_b.Keys()?.key(auth_b.pass().lord().str)), false);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function message_of(land, link) {
        return land.Pawn($bog_gram_message).Head(link.head());
    }
    function strings(list) {
        return (list?.items() ?? []).map(String);
    }
    $mol_test({
        async 'Удалённый диалог оседает в Hidden и инвайтом не возвращается'($) {
            const land = $giper_baza_land.make({ $ });
            const store = land.Data($bog_gram_dialogs);
            store.Dialogs('auto').add('DialogKeep');
            store.Dialogs('auto').add('DialogDrop');
            store.Dialogs('auto').cut('DialogDrop');
            store.Hidden('auto').add('DialogDrop');
            $mol_assert_equal(strings(store.Dialogs()), ['DialogKeep']);
            const hidden = new Set(strings(store.Hidden()));
            $mol_assert_equal(hidden.has('DialogDrop'), true);
            $mol_assert_equal(hidden.has('DialogKeep'), false);
            const merged = ['DialogKeep', 'DialogDrop'].filter(link => !hidden.has(link));
            $mol_assert_equal(merged, ['DialogKeep']);
        },
        async 'Заявка проходит очередь, отправленное и приём'($) {
            const land = $giper_baza_land.make({ $ });
            const store = land.Data($bog_gram_dialogs);
            const waiting = 'AAAAAAAA_BBBBBBBB';
            const answered = 'CCCCCCCC_DDDDDDDD';
            $mol_assert_equal(strings(store.Asks()).length, 0);
            $mol_assert_equal(strings(store.Asked()).length, 0);
            store.Asks('auto').add(waiting);
            store.Asks('auto').add(answered);
            store.Asks('auto').add(waiting);
            $mol_assert_equal(strings(store.Asks()).length, 2);
            for (const id of [waiting, answered]) {
                store.Asked('auto').add(id);
                store.Asks('auto').cut(id);
            }
            $mol_assert_equal(strings(store.Asks()).length, 0);
            $mol_assert_equal(strings(store.Asked()).length, 2);
            store.Dialogs('auto').add(answered);
            store.Asked('auto').cut(answered);
            const asked = new Set(strings(store.Asked()));
            $mol_assert_equal(asked.has(waiting), true);
            $mol_assert_equal(asked.has(answered), false);
            const have = new Set(strings(store.Dialogs()));
            $mol_assert_equal([...asked].filter(id => !have.has(id)), [waiting]);
            $mol_assert_equal(strings(store.Outbox()).length, 0);
        },
        async 'Архив прячет диалог из списка, но не удаляет'($) {
            const land = $giper_baza_land.make({ $ });
            const store = land.Data($bog_gram_dialogs);
            store.Dialogs('auto').add('DialogPlain');
            store.Dialogs('auto').add('DialogFolded');
            store.Archived('auto').add('DialogFolded');
            const dialogs = strings(store.Dialogs());
            $mol_assert_equal(dialogs.length, 2);
            $mol_assert_equal(new Set(dialogs).has('DialogFolded'), true);
            const archived = new Set(strings(store.Archived()));
            $mol_assert_equal(dialogs.filter(id => !archived.has(id)), ['DialogPlain']);
            $mol_assert_equal(archived.has('DialogFolded'), true);
            store.Dialogs('auto').cut('DialogFolded');
            store.Hidden('auto').add('DialogFolded');
            const alive = new Set(strings(store.Dialogs()));
            const dropped = new Set(strings(store.Hidden()));
            const in_archive = strings(store.Archived()).filter(id => alive.has(id) && !dropped.has(id));
            $mol_assert_equal(in_archive.length, 0);
            store.Archived('auto').cut('DialogFolded');
            $mol_assert_equal(strings(store.Archived()).length, 0);
            $mol_assert_equal(strings(store.Dialogs()).length, 1);
        },
        async 'Избранное — ссылка на свой ленд с обычной сессией без отметок прочтения'($) {
            const owner = $giper_baza_land.make({ $ });
            const store = owner.Data($bog_gram_dialogs);
            store.Saved_land('auto')?.val('SavedLandLink');
            $mol_assert_equal(store.Saved_land().val(), 'SavedLandLink');
            const saved = $giper_baza_land.make({ $ });
            const session = saved.Data($bog_gram_session);
            const note = session.Messages('auto').make(null);
            note.Text('auto')?.val('Не забыть купить хлеб');
            note.Author('auto')?.val('LordMine');
            note.Moment('auto')?.val(1000);
            const links = session.Messages().items();
            $mol_assert_equal(links.length, 1);
            const found = message_of(saved, links[0]);
            $mol_assert_equal(found.Text().val(), 'Не забыть купить хлеб');
            $mol_assert_equal(found.Author().val(), 'LordMine');
            found.Text('auto')?.val('Хлеб и молоко');
            found.Edited('auto')?.val(1500);
            $mol_assert_equal(message_of(saved, links[0]).Text().val(), 'Хлеб и молоко');
            $mol_assert_equal(session.Reads()?.key('LordMine')?.Moment()?.val() ?? 0, 0);
        },
        async 'Подпись собеседника лежит по ключу-лорду, снятая подпись пустая'($) {
            const land = $giper_baza_land.make({ $ });
            const store = land.Data($bog_gram_dialogs);
            const peer = 'LordPeerWithVeryLongIdentifier';
            $mol_assert_equal(store.Notes()?.key(peer)?.Title()?.val() ?? '', '');
            store.Notes('auto')?.key(peer, 'auto')?.Title('auto')?.val('Костя с работы');
            $mol_assert_equal(store.Notes()?.key(peer)?.Title()?.val() ?? '', 'Костя с работы');
            $mol_assert_equal(Boolean(store.Notes()?.key('LordStranger')), false);
            store.Notes('auto')?.key(peer, 'auto')?.Title('auto')?.val('');
            $mol_assert_equal(store.Notes()?.key(peer)?.Title()?.val() ?? '', '');
        },
        async 'Согласие на собеседника не задваивается и не задевает скрытые диалоги'($) {
            const land = $giper_baza_land.make({ $ });
            const store = land.Data($bog_gram_dialogs);
            const known = 'LordKnown';
            $mol_assert_equal(strings(store.Accepted()).length, 0);
            store.Accepted('auto').add(known);
            store.Accepted('auto').add(known);
            $mol_assert_equal(strings(store.Accepted()), [known]);
            store.Hidden('auto').add('DialogFromStranger');
            const hidden = new Set(strings(store.Hidden()));
            $mol_assert_equal(hidden.has('DialogFromStranger'), true);
            $mol_assert_equal(hidden.has(known), false);
            $mol_assert_equal(strings(store.Accepted()).length, 1);
            $mol_assert_equal(strings(store.Archived()).length, 0);
        },
        async 'Забыть реестр — локальная операция, запись в нём остаётся'($) {
            const king = await $.$giper_baza_auth._generate();
            const me = await $.$giper_baza_auth._generate();
            const my_lord = me.pass().lord().str;
            const registry0 = $giper_baza_land.make({ $, auth: () => king });
            registry0.give(null, $giper_baza_rank_post('just'));
            const registry_me = $giper_baza_land.make({ $, link: () => registry0.link(), auth: () => me });
            await $mol_wire_async(registry_me).units_steal(registry0);
            registry_me.Data($bog_gram_users).Lords('auto').add(my_lord);
            const private_land = $giper_baza_land.make({ $, auth: () => me });
            const store = private_land.Data($bog_gram_dialogs);
            const link = registry0.link().str;
            store.Registries('auto').add(link);
            store.Registries('auto').add('OtherRegistry');
            store.Registries('auto').cut(link);
            const known = strings(store.Registries());
            $mol_assert_equal(known.includes(link), false);
            $mol_assert_equal(known.includes('OtherRegistry'), true);
            const lords = strings(registry_me.Data($bog_gram_users).Lords());
            $mol_assert_equal(lords.includes(my_lord), true);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Ключ в старые реестры кладётся один раз, потом схема помечена и проход молчит'($) {
            const my = 'LordMine';
            const pass = 'PassMine';
            const dialogs = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const joined = $giper_baza_land.make({ $ }).Data($bog_gram_users);
            const foreign = $giper_baza_land.make({ $ }).Data($bog_gram_users);
            const account = $bog_gram_account.make({ $, my_lord: () => my, my_pass: () => pass, dialogs_store: () => dialogs });
            const start = () => $bog_gram_registry.make({ $,
                Account: () => account,
                store: (id) => id === 'Joined' ? joined : foreign,
            });
            const registry = start();
            dialogs.Registries('auto').add('Joined');
            dialogs.Registries('auto').add('Foreign');
            joined.Lords('auto').add(my);
            $mol_assert_equal(registry.keys_fill(), 1);
            $mol_assert_equal(String(joined.Keys()?.key(my)?.Pass()?.val() ?? ''), pass);
            $mol_assert_equal(foreign.Keys()?.key(my) ?? null, null);
            $mol_assert_equal(dialogs.Schema()?.val(), 2);
            joined.Keys('auto')?.key(my, 'auto')?.Pass('auto')?.val('Stale');
            $mol_assert_equal(start().keys_fill(), 0);
            $mol_assert_equal(String(joined.Keys()?.key(my)?.Pass()?.val() ?? ''), 'Stale');
        },
        async 'Люди из реестров собираются без меня, их ключ находится по лорду'($) {
            const me = await $.$giper_baza_auth._generate();
            const ann = await $.$giper_baza_auth._generate();
            const my = me.pass().lord().str;
            const ann_lord = ann.pass().lord().str;
            const id = 'AAAAAAAA_BBBBBBBB';
            const dialogs = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const users = $giper_baza_land.make({ $ }).Data($bog_gram_users);
            const account = $bog_gram_account.make({ $, my_lord: () => my, dialogs_store: () => dialogs });
            const registry = $bog_gram_registry.make({ $, Account: () => account, store: () => users });
            dialogs.Registries('auto').add(id);
            users.Title('auto')?.val('Соседи по даче');
            users.Lords('auto').add(my);
            users.Lords('auto').add(ann_lord);
            users.Keys('auto')?.key(ann_lord, 'auto')?.Pass('auto')?.val(ann.pass().toString());
            $mol_assert_equal(registry.title(id), 'Соседи по даче');
            $mol_assert_equal(registry.status(id), '2 участника · вы в списке');
            $mol_assert_equal(Object.keys(registry.sources()), [ann_lord]);
            $mol_assert_equal(registry.source_title(ann_lord), '');
            $mol_assert_equal(registry.pass_of(ann_lord)?.lord().str, ann_lord);
            $mol_assert_equal(registry.pass_of(my), null);
        },
        async 'Забытый реестр уходит из своего списка и с адреса'($) {
            const dialogs = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const account = $bog_gram_account.make({ $, dialogs_store: () => dialogs });
            const registry = $bog_gram_registry.make({ $, Account: () => account });
            const id = 'AAAAAAAA_BBBBBBBB';
            registry.open(id);
            $mol_assert_equal(registry.remember(), id);
            $mol_assert_equal(registry.ids(), [id]);
            registry.forget(id);
            $mol_assert_equal(registry.ids(), []);
            $mol_assert_equal(registry.active(), '');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Заголовок дня и время сообщения форматируются по-человечески'() {
            const now = new Date();
            $mol_assert_equal($bog_gram_clock.day_title(now.toDateString()), 'Сегодня');
            $mol_assert_equal($bog_gram_clock.day_title(new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()), 'Вчера');
            $mol_assert_equal($bog_gram_clock.day_title(''), '');
            $mol_assert_equal($bog_gram_clock.day_title(new Date(2020, 0, 15).toDateString()).includes('2020'), true);
            $mol_assert_equal($bog_gram_clock.time(new Date(2020, 0, 15, 9, 5).getTime()), '09:05');
            $mol_assert_equal($bog_gram_clock.time(new Date(2020, 0, 15, 23, 59).getTime()), '23:59');
        },
        'В списке сегодняшнее показывается временем, прошлое — датой'() {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 5).getTime();
            $mol_assert_equal($bog_gram_clock.brief(today), '09:05');
            $mol_assert_equal($bog_gram_clock.brief(new Date(2020, 0, 15, 9, 5).getTime()), '15.01');
            $mol_assert_equal($bog_gram_clock.brief(0), '');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function message_of(land, link) {
        return land.Pawn($bog_gram_message).Head(link.head());
    }
    function list_of(land) {
        return land.Data($bog_gram_session).Messages().items()
            .map(link => message_of(land, link));
    }
    function write(land, moment, text, author = '') {
        const message = land.Data($bog_gram_session).Messages('auto').make(null);
        message.Text('auto')?.val(text);
        message.Moment('auto')?.val(moment);
        if (author)
            message.Author('auto')?.val(author);
        return message;
    }
    $mol_test({
        async 'Избранное собирается изо всех своих лендов, пишется в указанный'($) {
            const store = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const account = $bog_gram_account.make({ $, dialogs_store: () => store });
            const talk = $bog_gram_talk.make({ $, Account: () => account });
            const first = 'AAAAAAAA_BBBBBBBB';
            const second = 'CCCCCCCC_DDDDDDDD';
            $mol_assert_equal(talk.saved_links().length, 0);
            $mol_assert_equal(talk.saved_is(first), false);
            store.Saved_land('auto')?.val(first);
            store.Saved_lands('auto').add(first);
            $mol_assert_equal(talk.saved_links().join(), first);
            store.Saved_lands('auto').add(second);
            store.Saved_land('auto')?.val(second);
            $mol_assert_equal(talk.saved_is(first), true);
            $mol_assert_equal(talk.saved_is(second), true);
            $mol_assert_equal(talk.saved_is('DialogPlain'), false);
            $mol_assert_equal(talk.saved_is(''), false);
            const links = talk.saved_links();
            $mol_assert_equal(links.length, 2);
            $mol_assert_equal(links[links.length - 1], second);
            $mol_assert_equal(talk.links_of(second).join(), links.join());
            $mol_assert_equal(talk.links_of(first).join(), links.join());
        },
        'Бакеты идут друг за другом по первому сообщению, внутри порядок списка'($) {
            const talk = $bog_gram_talk.make({ $ });
            const early = $giper_baza_land.make({ $ });
            const late = $giper_baza_land.make({ $ });
            write(early, 1000, 'первое');
            write(early, 900, 'второе');
            write(late, 5000, 'третье');
            write(late, 6000, 'четвёртое');
            const text = (list) => list.map(item => item.Text().val()).join(' ');
            $mol_assert_equal(text(talk.messages_merge([list_of(early), list_of(late)])), 'первое второе третье четвёртое');
            $mol_assert_equal(text(talk.messages_merge([list_of(late), list_of(early)])), 'первое второе третье четвёртое');
            $mol_assert_equal(text(talk.messages_merge([[], list_of(early), []])), 'первое второе');
            $mol_assert_equal(talk.messages_merge([]).length, 0);
            const tie_one = $giper_baza_land.make({ $ });
            const tie_two = $giper_baza_land.make({ $ });
            write(tie_one, 5000, 'один');
            write(tie_two, 5000, 'два');
            $mol_assert_equal(text(talk.messages_merge([list_of(tie_one), list_of(tie_two)])), text(talk.messages_merge([list_of(tie_two), list_of(tie_one)])));
        },
        'Своё сообщение в диалоге считается, чужое и удалённое нет'($) {
            const land = $giper_baza_land.make({ $ });
            const talk = $bog_gram_talk.make({ $ });
            $mol_assert_equal(talk.mine_among([], 'LordMine'), false);
            write(land, 1000, 'Эй', 'LordPeer');
            $mol_assert_equal(talk.mine_among(list_of(land), 'LordMine'), false);
            const mine = write(land, 2000, 'Привет', 'LordMine');
            $mol_assert_equal(talk.mine_among(list_of(land), 'LordMine'), true);
            mine.Deleted('auto')?.val(3000);
            $mol_assert_equal(talk.mine_among(list_of(land), 'LordMine'), false);
        },
        'Непрочитанные считаются с хвоста до своей отметки, свои и удалённые не в счёт'($) {
            const land = $giper_baza_land.make({ $ });
            const talk = $bog_gram_talk.make({ $ });
            write(land, 1000, 'старое', 'LordPeer');
            write(land, 2000, 'моё', 'LordMine');
            write(land, 3000, 'новое', 'LordPeer');
            write(land, 4000, 'ещё', 'LordPeer').Deleted('auto')?.val(4500);
            write(land, 5000, 'последнее', 'LordPeer');
            $mol_assert_equal(talk.unread_since(list_of(land), 'LordMine', 0), 3);
            $mol_assert_equal(talk.unread_since(list_of(land), 'LordMine', 2000), 2);
            $mol_assert_equal(talk.unread_since(list_of(land), 'LordMine', 5000), 0);
            $mol_assert_equal(talk.unread_since(list_of(land), 'LordMine', 0, 2), 2);
        },
        'Пока отметка прочтения едет, её чтение ждёт, а не отдаёт ноль'($) {
            const wait = new Promise(() => { });
            const talk = $bog_gram_talk.make({ $, lands_of: () => [{ Data: () => { throw wait; } }] });
            let thrown = null;
            try {
                talk.read_moment_of('dialog', 'Me');
            }
            catch (error) {
                thrown = error;
            }
            $mol_assert_equal(thrown, wait);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Запечатанную ссылку открывает только адресат, подмену печать отвергает'($) {
            const sender = await $.$giper_baza_auth._generate();
            const target = await $.$giper_baza_auth._generate();
            const stranger = await $.$giper_baza_auth._generate();
            const seal = $mol_wire_async($bog_gram_seal);
            const link = 'ABCDEFGH_IJKLMNOP';
            const entry = await seal.close(sender, target.pass(), 'invite', link);
            const again = await seal.close(sender, target.pass(), 'invite', link);
            const parts = entry.split('|');
            parts[3] = parts[3].slice(0, -2) + (parts[3].endsWith('AA') ? 'BB' : 'AA');
            const forged = parts.join('|');
            const opened = await seal.open(target, 'invite', entry);
            const alien = await seal.open(stranger, 'invite', entry);
            const other_kind = await seal.open(target, 'deny', entry);
            const broken = await seal.open(target, 'invite', forged);
            $mol_assert_equal(entry, again);
            $mol_assert_equal(entry.includes(link), false);
            $mol_assert_equal(opened?.open, link);
            $mol_assert_equal(opened?.lord, sender.pass().lord().str);
            $mol_assert_equal(alien, null);
            $mol_assert_equal(other_kind, null);
            $mol_assert_equal(broken, null);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Имя собеседника берётся из общего диалога и только от него самого'($) {
            const king = await $.$giper_baza_auth._generate();
            const ann = await $.$giper_baza_auth._generate();
            const bob = await $.$giper_baza_auth._generate();
            const ann_lord = ann.pass().lord().str;
            const bob_lord = bob.pass().lord().str;
            const land0 = $giper_baza_land.make({ $, auth: () => king });
            await $mol_wire_async(() => {
                land0.give(ann.pass(), $giper_baza_rank_post('just'));
                land0.give(bob.pass(), $giper_baza_rank_post('just'));
                return true;
            })();
            const write = async (auth, lord, name) => {
                const copy = $giper_baza_land.make({ $, link: () => land0.link(), auth: () => auth });
                await $mol_wire_async(copy).units_steal(land0);
                await $mol_wire_async(() => {
                    copy.Data($bog_gram_dialog).Names('auto').key(lord, 'auto').Title('auto').val(name);
                    return true;
                })();
                await $mol_wire_async(land0).units_steal(copy);
            };
            await write(ann, ann_lord, 'Анна');
            await write(bob, ann_lord, 'Подделка');
            await write(bob, bob_lord, 'Боб');
            const id = land0.link().str;
            const talk = $bog_gram_talk.make({ $, store: () => land0.Data($bog_gram_dialog) });
            const roster = $bog_gram_roster.make({ $, Talk: () => talk, ids: () => [id] });
            $mol_assert_equal(roster.name_of(id, ann_lord), 'Анна');
            $mol_assert_equal(roster.name_of(id, bob_lord), 'Боб');
            $mol_assert_equal(roster.names()[ann_lord], 'Анна');
            $mol_assert_equal(roster.names()[bob_lord], 'Боб');
            $mol_assert_equal(Object.keys(roster.names()).length, 2);
        },
        'Чужой диалог показывается по сообщениям и знакомству'($) {
            const roster = $bog_gram_roster.make({ $ });
            $mol_assert_equal(roster.sort(true, false, false), 'plain');
            $mol_assert_equal(roster.sort(true, true, false), 'plain');
            $mol_assert_equal(roster.sort(false, false, true), 'skip');
            $mol_assert_equal(roster.sort(false, false, false), 'skip');
            $mol_assert_equal(roster.sort(false, true, true), 'plain');
            $mol_assert_equal(roster.sort(false, true, false), 'request');
        },
        'Список раскладывает диалоги по полкам: общий, запросы, архив'($) {
            const store = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const account = $bog_gram_account.make({ $, dialogs_store: () => store });
            const kinds = {
                Mine: 'plain',
                Stranger: 'request',
                Empty: 'skip',
                Folded: 'plain',
            };
            const talk = $bog_gram_talk.make({ $, Account: () => account, fresh_first: (ids) => [...ids].sort() });
            const roster = $bog_gram_roster.make({ $,
                Account: () => account,
                Talk: () => talk,
                kind: (id) => kinds[id],
            });
            for (const id of Object.keys(kinds))
                store.Dialogs('auto').add(id);
            store.Archived('auto').add('Folded');
            $mol_assert_equal(roster.visible(), ['Mine']);
            $mol_assert_equal(roster.requests(), ['Stranger']);
            $mol_assert_equal(roster.archived(), ['Folded']);
            roster.unarchive('Folded');
            $mol_assert_equal(roster.archived(), []);
            $mol_assert_equal(roster.visible(), ['Folded', 'Mine']);
        },
        'Приглашённый диалог виден без копирования, убранный не возвращается, мусор отсеивается'($) {
            const keep = 'AAAAAAAA_BBBBBBBB';
            const drop = 'CCCCCCCC_DDDDDDDD';
            const fresh = 'EEEEEEEE_FFFFFFFF';
            const store = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const monitor = $giper_baza_land.make({ $ }).Data($bog_gram_monitor);
            const account = $bog_gram_account.make({ $,
                dialogs_store: () => store,
                monitor_store: () => monitor,
                invites: () => [keep, drop, fresh, 'не ссылка'],
            });
            const talk = $bog_gram_talk.make({ $, Account: () => account, links_of: () => [] });
            const roster = $bog_gram_roster.make({ $, Account: () => account, Talk: () => talk });
            store.Dialogs('auto').add(keep);
            store.Archived('auto').add(drop);
            $mol_assert_equal([...roster.ids()].sort(), [keep, drop, fresh].sort());
            roster.drop(drop);
            $mol_assert_equal([...roster.ids()].sort(), [keep, fresh].sort());
            $mol_assert_equal(roster.hidden(), [drop]);
            $mol_assert_equal(roster.archive_links(), []);
            $mol_assert_equal(store.Dialogs().items().map(String), [keep]);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Ключ из ссылки проверяется и не теряется после ухода экрана'($) {
            const peer = await $.$giper_baza_auth._generate();
            const other = await $.$giper_baza_auth._generate();
            const lord = peer.pass().lord().str;
            const key = peer.pass().toString();
            const king = await $.$giper_baza_auth._generate();
            const dialogs = $giper_baza_land.make({ $, auth: () => king }).Data($bog_gram_dialogs);
            const account = $bog_gram_account.make({ $, dialogs_store: () => dialogs });
            const first = $bog_gram_people.make({ $, Account: () => account });
            $mol_assert_equal(first.pass_learn(lord, other.pass().toString()), null);
            $mol_assert_equal(first.pass_learn(lord, 'мусор'), null);
            $mol_assert_equal(first.pass_learn(lord, ''), null);
            const learned = first.pass_learn(lord, key);
            $mol_assert_equal(learned?.lord().str, lord);
            $mol_assert_equal(first.pass_of(lord), learned);
            const next = $bog_gram_people.make({ $, Account: () => account });
            $mol_assert_equal(next.pass_given(lord), null);
            $mol_assert_equal(next.pass_of(lord)?.lord().str, lord);
        },
        async 'Ключ давнего собеседника берётся из общего диалога, без его домашнего ленда'($) {
            const peer = await $.$giper_baza_auth._generate();
            const king_dialog = await $.$giper_baza_auth._generate();
            const king_session = await $.$giper_baza_auth._generate();
            const lord = peer.pass().lord().str;
            const dialog = $giper_baza_land.make({ $, auth: () => king_dialog });
            const session = $giper_baza_land.make({ $, auth: () => king_session });
            await $mol_wire_async(dialog).encrypted(true);
            await $mol_wire_async(session).encrypted(true);
            const lands = {
                [dialog.link().str]: dialog,
                [session.link().str]: session,
            };
            const dialogs = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const account = $bog_gram_account.make({ $, dialogs_store: () => dialogs });
            const registry = $bog_gram_registry.make({ $, Account: () => account, pass_of: () => null });
            const talk = $bog_gram_talk.make({ $, Account: () => account, land: id => lands[id] ?? $giper_baza_land.make({ $ }) });
            const roster = $bog_gram_roster.make({ $, Account: () => account, Talk: () => talk });
            const people = $bog_gram_people.make({ $, Account: () => account, Registry: () => registry, Roster: () => roster });
            const ops = {
                fill() {
                    dialog.give(peer.pass(), $giper_baza_rank_post('fast'));
                    session.give(peer.pass(), $giper_baza_rank_post('fast'));
                    dialog.Data($bog_gram_dialog).Sessions('auto').add(session.link().str);
                    return true;
                },
                before() {
                    return people.pass_of(lord)?.lord().str ?? '';
                },
                join() {
                    dialogs.Dialogs('auto').add(dialog.link().str);
                    return true;
                },
                after() {
                    return people.pass_of(lord)?.lord().str ?? '';
                },
            };
            await $mol_wire_async(ops).fill();
            $mol_assert_equal(await $mol_wire_async(ops).before(), '');
            await $mol_wire_async(ops).join();
            $mol_assert_equal(await $mol_wire_async(ops).after(), lord);
        },
        async 'Подпись собеседника перекрывает его имя, а пустая возвращает имя'($) {
            const dialogs = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const account = $bog_gram_account.make({ $, dialogs_store: () => dialogs });
            const people = $bog_gram_people.make({ $, Account: () => account, name: () => 'Иииии' });
            const peer = 'LordPeerWithVeryLongIdentifier';
            $mol_assert_equal(people.label(peer), 'Иииии');
            people.note_set(peer, 'Костя с работы');
            $mol_assert_equal(people.label(peer), 'Костя с работы');
            people.note_set(peer, '');
            $mol_assert_equal(people.label(peer), 'Иииии');
        },
        async 'Согласие даётся человеку один раз и только настоящему лорду'($) {
            const auth = await $.$giper_baza_auth._generate();
            const lord = auth.pass().lord().str;
            const dialogs = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const account = $bog_gram_account.make({ $, dialogs_store: () => dialogs, my_lord: () => 'LordMine' });
            const registry = $bog_gram_registry.make({ $, Account: () => account, sources: () => ({}) });
            const people = $bog_gram_people.make({ $, Account: () => account, Registry: () => registry });
            $mol_assert_equal(people.known(lord), false);
            people.accept(lord);
            people.accept(lord);
            people.accept('не лорд');
            people.accept('LordMine');
            $mol_assert_equal(people.accepted(), [lord]);
            $mol_assert_equal(people.known(lord), true);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Своё имя хранится в приватном списке, открытое из профиля переезжает туда и стирается'($) {
            const dialogs = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const profile = $giper_baza_land.make({ $ }).Data($bog_gram_user);
            const account = $bog_gram_account.make({ $, dialogs_store: () => dialogs, user_store: () => profile });
            profile.Name('auto').val('Кирилл');
            $mol_assert_equal(account.user_name(), 'Кирилл');
            account.name_hide();
            $mol_assert_equal(String(dialogs.Name()?.val() ?? ''), 'Кирилл');
            $mol_assert_equal(String(profile.Name()?.val() ?? ''), '');
            account.user_name('Кирилл Н.');
            $mol_assert_equal(account.user_name(), 'Кирилл Н.');
            $mol_assert_equal(String(profile.Name()?.val() ?? ''), '');
        },
        async 'Монитор закрыт для всех, а демон с выданным правом его читает'($) {
            const daemon = await $.$giper_baza_auth._generate();
            const stranger = await $.$giper_baza_auth._generate();
            const profile = $giper_baza_land.make({ $ }).Data($bog_gram_user);
            const account = $bog_gram_account.make({ $, user_store: () => profile });
            const land = await $mol_wire_async(account).monitor_land();
            $mol_assert_equal(land.encrypted(), true);
            $mol_assert_equal(String(profile.Watch_land()?.val() ?? ''), land.link().str);
            await $mol_wire_async(() => {
                account.monitor_store().Watch('auto').add('SessionLink');
                return true;
            })();
            $mol_assert_equal(await $mol_wire_async(account).monitor_grant(daemon.pass().toString()), true);
            $mol_assert_equal(await $mol_wire_async(account).monitor_grant(daemon.pass().toString()), false);
            $mol_assert_equal(land.pass_rank(daemon.pass()), $giper_baza_rank_read);
            $mol_assert_equal(land.pass_rank(stranger.pass()), $giper_baza_rank_deny);
            $mol_assert_equal(land.lord_rank(null), $giper_baza_rank_deny);
        },
        async 'Запрос принимается и убирается локально, даже когда свой список не пишется, и переезжает в него потом'($) {
            const king = await $.$giper_baza_auth._generate();
            const owned = $giper_baza_land.make({ $, auth: () => king });
            const locked = $giper_baza_land.make({ $, link: () => owned.link() }).Data($bog_gram_dialogs);
            const open = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            $mol_assert_equal(locked.can_change(), false);
            const lord = 'AAAAAAAA_BBBBBBBB';
            const dialog = 'CCCCCCCC_DDDDDDDD';
            const offline = $bog_gram_account.make({ $, my_lord: () => 'LordLocal', dialogs_store: () => locked });
            const people = $bog_gram_people.make({ $, Account: () => offline });
            const talk = $bog_gram_talk.make({ $, Account: () => offline, links_of: () => [], saved_is: () => false });
            const roster = $bog_gram_roster.make({ $, Account: () => offline, Talk: () => talk });
            await $mol_wire_async(people).accept(lord);
            await $mol_wire_async(roster).drop(dialog);
            $mol_assert_equal(people.accepted(), [lord]);
            $mol_assert_equal(roster.hidden(), [dialog]);
            const online = $bog_gram_account.make({ $, my_lord: () => 'LordLocal', dialogs_store: () => open });
            $mol_assert_equal(online.decisions_flush(), 2);
            $mol_assert_equal(open.Accepted().items().map(String), [lord]);
            $mol_assert_equal(open.Hidden().items().map(String), [dialog]);
            $mol_assert_equal(online.local_list('accepted'), []);
            $mol_assert_equal(online.local_list('hidden'), []);
        },
        async 'Новое лобби открыто всем и встаёт в профиль, прежнее читается дальше'($) {
            const king_lobby = await $.$giper_baza_auth._generate();
            const king_user = await $.$giper_baza_auth._generate();
            const king_dialogs = await $.$giper_baza_auth._generate();
            const lobby = $giper_baza_land.make({ $, auth: () => king_lobby });
            const profile = $giper_baza_land.make({ $, auth: () => king_user }).Data($bog_gram_user);
            const dialogs = $giper_baza_land.make({ $, auth: () => king_dialogs }).Data($bog_gram_dialogs);
            profile.Inbox_land('auto')?.val('OldLobbyLink');
            const account = $bog_gram_account.make({ $,
                inbox_land: () => lobby,
                user_store: () => profile,
                dialogs_store: () => dialogs,
            });
            account.inbox_open();
            account.inbox_publish();
            $mol_assert_equal(lobby.lord_rank(null), $giper_baza_rank_post('slow'));
            $mol_assert_equal(profile.Inbox_land()?.val(), lobby.link().str);
            $mol_assert_equal(account.lobbies_old(), ['OldLobbyLink']);
        },
        async 'Записи лобби читаются одним списком и снимаются по одной'($) {
            const inbox = $giper_baza_land.make({ $ }).Data($bog_gram_inbox);
            const dialogs = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const account = $bog_gram_account.make({ $,
                inbox_store: () => inbox,
                dialogs_store: () => dialogs,
            });
            inbox.Joins('auto').add('первая');
            inbox.Joins('auto').add('вторая');
            inbox.Denies('auto').add('отказ');
            $mol_assert_equal(new Set(account.joins()).size, 2);
            $mol_assert_equal(account.denies(), ['отказ']);
            $mol_assert_equal(account.invites(), []);
            account.joins_cut('первая');
            $mol_assert_equal(account.joins(), ['вторая']);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Без ключа человека группа сперва не создаётся, а называет потерю'($) {
            const people = $bog_gram_people.make({ $, pass_of: () => null });
            const account = $bog_gram_account.make({ $, my_lord: () => 'LordMine' });
            const crew = $bog_gram_crew.make({ $, People: () => people, Account: () => account });
            $mol_assert_equal(crew.group_make('Дача', ['LordLost'], false), { id: '', lost: ['LordLost'] });
            $mol_assert_equal(crew.group_make('Дача', ['LordLost'], true), { id: '', lost: [] });
            $mol_assert_equal(crew.group_make('Дача', ['LordMine'], false), { id: '', lost: [] });
        },
        async 'Исключённый теряет новый бакет, но не старый'($) {
            const king_dialog = await $.$giper_baza_auth._generate();
            const king_old = await $.$giper_baza_auth._generate();
            const king_new = await $.$giper_baza_auth._generate();
            const auth_stay = await $.$giper_baza_auth._generate();
            const auth_out = await $.$giper_baza_auth._generate();
            const lord_stay = auth_stay.pass().lord().str;
            const lord_out = auth_out.pass().lord().str;
            const dialog = $giper_baza_land.make({ $, auth: () => king_dialog });
            const old_bucket = $giper_baza_land.make({ $, auth: () => king_old });
            const new_bucket = $giper_baza_land.make({ $, auth: () => king_new });
            await $mol_wire_async(old_bucket).encrypted(true);
            await $mol_wire_async(new_bucket).encrypted(true);
            const ops = {
                start() {
                    old_bucket.give(auth_stay.pass(), $giper_baza_rank_post('just'));
                    old_bucket.give(auth_out.pass(), $giper_baza_rank_post('just'));
                    return true;
                },
                part() {
                    new_bucket.give(auth_stay.pass(), $giper_baza_rank_post('just'));
                    return true;
                },
                fill() {
                    const data = dialog.Data($bog_gram_dialog);
                    data.Peers('auto').add(king_dialog.pass().lord().str);
                    data.Peers('auto').add(lord_stay);
                    data.Peers('auto').add(lord_out);
                    data.Sessions('auto').add(old_bucket.link().str);
                    data.Sessions('auto').add(new_bucket.link().str);
                    data.Peers('auto').cut(lord_out);
                    return true;
                },
                read() {
                    const data = dialog.Data($bog_gram_dialog);
                    return {
                        peers: data.Peers().items().map(String),
                        sessions: data.Sessions().items().map(String),
                        out_old: old_bucket.lord_rank(auth_out.pass().lord()),
                        out_new: new_bucket.lord_rank(auth_out.pass().lord()),
                        stay_new: new_bucket.lord_rank(auth_stay.pass().lord()),
                    };
                },
            };
            await $mol_wire_async(ops).start();
            await $mol_wire_async(ops).part();
            await $mol_wire_async(ops).fill();
            const state = await $mol_wire_async(ops).read();
            $mol_assert_equal(state.peers.includes(lord_out), false);
            $mol_assert_equal(state.peers.includes(lord_stay), true);
            $mol_assert_equal(state.sessions.length, 2);
            $mol_assert_equal(state.sessions.includes(old_bucket.link().str), true);
            $mol_assert_equal(state.sessions.includes(new_bucket.link().str), true);
            $mol_assert_equal(state.out_old, $giper_baza_rank_post('just'));
            $mol_assert_equal(state.out_new, $giper_baza_rank_deny);
            $mol_assert_equal(state.stay_new, $giper_baza_rank_post('just'));
        },
        async 'Добавленный без истории видит только новый бакет'($) {
            const king_dialog = await $.$giper_baza_auth._generate();
            const king_old = await $.$giper_baza_auth._generate();
            const king_fresh = await $.$giper_baza_auth._generate();
            const auth_old = await $.$giper_baza_auth._generate();
            const auth_new = await $.$giper_baza_auth._generate();
            const dialog = $giper_baza_land.make({ $, auth: () => king_dialog });
            const old_bucket = $giper_baza_land.make({ $, auth: () => king_old });
            const fresh = $giper_baza_land.make({ $, auth: () => king_fresh });
            await $mol_wire_async(old_bucket).encrypted(true);
            await $mol_wire_async(fresh).encrypted(true);
            const ops = {
                start() {
                    old_bucket.give(auth_old.pass(), $giper_baza_rank_post('just'));
                    return true;
                },
                join() {
                    fresh.give(auth_old.pass(), $giper_baza_rank_post('just'));
                    fresh.give(auth_new.pass(), $giper_baza_rank_post('just'));
                    return true;
                },
                fill() {
                    const data = dialog.Data($bog_gram_dialog);
                    data.Peers('auto').add(auth_old.pass().lord().str);
                    data.Sessions('auto').add(old_bucket.link().str);
                    data.Peers('auto').add(auth_new.pass().lord().str);
                    data.Sessions('auto').add(fresh.link().str);
                    return true;
                },
                read() {
                    const data = dialog.Data($bog_gram_dialog);
                    return {
                        sessions: data.Sessions().items().length,
                        new_old: old_bucket.lord_rank(auth_new.pass().lord()),
                        new_fresh: fresh.lord_rank(auth_new.pass().lord()),
                        old_old: old_bucket.lord_rank(auth_old.pass().lord()),
                        old_fresh: fresh.lord_rank(auth_old.pass().lord()),
                        king_old_rank: old_bucket.lord_rank(king_old.pass().lord()),
                        king_fresh_rank: fresh.lord_rank(king_fresh.pass().lord()),
                    };
                },
            };
            await $mol_wire_async(ops).start();
            await $mol_wire_async(ops).join();
            await $mol_wire_async(ops).fill();
            const state = await $mol_wire_async(ops).read();
            $mol_assert_equal(state.sessions, 2);
            $mol_assert_equal(state.new_old, $giper_baza_rank_deny);
            $mol_assert_equal(state.new_fresh, $giper_baza_rank_post('just'));
            $mol_assert_equal(state.old_old, $giper_baza_rank_post('just'));
            $mol_assert_equal(state.old_fresh, $giper_baza_rank_post('just'));
            $mol_assert_equal(state.king_old_rank, $giper_baza_rank_rule);
            $mol_assert_equal(state.king_fresh_rank, $giper_baza_rank_rule);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    function lobby_with(context, inbox, store, rest = {}) {
        const account = $bog_gram_account.make({ $: context, inbox_store: () => inbox, dialogs_store: () => store });
        const roster = $bog_gram_roster.make({ $: context, Account: () => account });
        return $bog_gram_lobby.make({ $: context, Account: () => account, Roster: () => roster, ...rest });
    }
    $mol_test({
        async 'Ссылка в группу несёт создателя: участника открывает, остальных ведёт к заявке'($) {
            const owner = await $.$giper_baza_auth._generate();
            const owner_lord = owner.pass().lord().str;
            const group = new $giper_baza_link(owner_lord + '_KJhgFdSa').str;
            const my = 'LordMine';
            const lobby = $bog_gram_lobby.make({ $, join_owner_of: () => owner_lord });
            const uri = lobby.join_uri(group);
            $mol_assert_equal(uri, $.$mol_state_arg.make_link({ join: group, by: owner_lord }));
            $mol_assert_equal(lobby.join_uri(''), '');
            const blind = $bog_gram_lobby.make({ $, join_owner_of: () => '' });
            $mol_assert_equal(blind.join_uri(group), $.$mol_state_arg.make_link({ join: group }));
            $mol_assert_equal(lobby.join_plan(group, my, true), 'open');
            $mol_assert_equal(lobby.join_plan(group, my, false), 'ask');
            $mol_assert_equal(lobby.join_plan('', my, false), 'skip');
            $mol_assert_equal(lobby.join_plan(my, my, false), 'skip');
            $mol_assert_equal(lobby.join_plan('не ссылка', my, false), 'skip');
        },
        'Запись очереди заявок помнит создателя группы'($) {
            const lobby = $bog_gram_lobby.make({ $ });
            const group = 'AAAAAAAA_BBBBBBBB';
            const owner = 'CCCCCCCC_DDDDDDDD';
            const task = lobby.task(group, owner);
            $mol_assert_equal(task, group + '|' + owner);
            $mol_assert_equal(lobby.task_group(task), group);
            $mol_assert_equal(lobby.task_owner(task), owner);
            $mol_assert_equal(lobby.task(group, ''), group);
            $mol_assert_equal(lobby.task_group(group), group);
            $mol_assert_equal(lobby.task_owner(group), '');
        },
        'Плашка заявок не обещает отправку раньше времени'($) {
            const group = 'AAAAAAAA_BBBBBBBB';
            const task = group + '|CCCCCCCC_DDDDDDDD';
            const make = (queued, sent, ids) => $bog_gram_lobby.make({ $,
                queued: () => queued,
                sent: () => sent,
                denied: () => [],
                Roster: () => $bog_gram_roster.make({ $, ids: () => ids }),
            });
            $mol_assert_equal(make([task], [], []).plate(), 'Заявка отправляется — это не мгновенно');
            $mol_assert_equal(make([], [task], []).plate(), 'Заявка отправлена — ждём, пока её примут');
            $mol_assert_equal(make([], [task], [group]).plate(), '');
            const lost = make([], [], []);
            lost.lost(group);
            $mol_assert_equal(lost.plate(), 'В ссылке нет создателя группы — заявку нести некому, попросите свежую');
        },
        'Отказ выводится из лобби без перекладывания, повторная заявка его снимает'($) {
            const inbox = $giper_baza_land.make({ $ }).Data($bog_gram_inbox);
            const store = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const lobby = lobby_with($, inbox, store);
            const group = 'AAAAAAAA_BBBBBBBB';
            const owner = 'CCCCCCCC_DDDDDDDD';
            const task = lobby.task(group, owner);
            store.Asked('auto').add(task);
            $mol_assert_equal(lobby.plate(), 'Заявка отправлена — ждём, пока её примут');
            inbox.Denies('auto').add(group);
            $mol_assert_equal(lobby.denied(), [group]);
            $mol_assert_equal(lobby.plate(), 'Заявку отклонили — попроситься снова можно по той же ссылке');
            $mol_assert_equal(store.Asked().items().map(String), [task]);
            $mol_assert_equal(inbox.Denies().items().map(String), [group]);
            lobby.send(group, owner);
            $mol_assert_equal(lobby.denied(), []);
            $mol_assert_equal(inbox.Denies().items().length, 0);
            $mol_assert_equal(lobby.asks()[group], { owner, state: 'queued' });
            $mol_assert_equal(store.Asks().items().map(String), [task]);
            $mol_assert_equal(store.Asked().items().length, 0);
            $mol_assert_equal(lobby.plate(), 'Заявка отправляется — это не мгновенно');
        },
        'Чужой отказ не трогает заявку'($) {
            const inbox = $giper_baza_land.make({ $ }).Data($bog_gram_inbox);
            const store = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const lobby = lobby_with($, inbox, store);
            store.Asked('auto').add(lobby.task('AAAAAAAA_BBBBBBBB', 'CCCCCCCC_DDDDDDDD'));
            inbox.Denies('auto').add('EEEEEEEE_FFFFFFFF');
            $mol_assert_equal(lobby.denied(), []);
            $mol_assert_equal(lobby.sent(), ['AAAAAAAA_BBBBBBBB']);
        },
        'Заявки из словаря и старых списков сливаются, доставленное не откатывается'($) {
            const inbox = $giper_baza_land.make({ $ }).Data($bog_gram_inbox);
            const store = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const lobby = lobby_with($, inbox, store);
            const owner = 'CCCCCCCC_DDDDDDDD';
            const old_queued = 'AAAAAAAA_AAAAAAAA';
            const fresh_sent = 'BBBBBBBB_BBBBBBBB';
            const both = 'EEEEEEEE_EEEEEEEE';
            store.Asks('auto').add(lobby.task(old_queued, owner));
            lobby.join_put(fresh_sent, owner, 'sent');
            lobby.join_put(both, owner, 'queued');
            store.Asked('auto').add(lobby.task(both, owner));
            $mol_assert_equal(lobby.asks()[old_queued], { owner, state: 'queued' });
            $mol_assert_equal(lobby.asks()[fresh_sent], { owner, state: 'sent' });
            $mol_assert_equal(lobby.asks()[both], { owner, state: 'sent' });
            $mol_assert_equal(lobby.queued(), [old_queued]);
        },
        'Приглашение уходит само, как только приехало лобби собеседника, без опроса по таймеру'($) {
            class Peer extends $mol_object {
                static reachable(next) {
                    return next ?? false;
                }
            }
            __decorate([
                $mol_mem
            ], Peer, "reachable", null);
            const inbox = $giper_baza_land.make({ $ }).Data($bog_gram_inbox);
            const store = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const lobby = lobby_with($, inbox, store, {
                invite_ready: () => true,
                invite_send: () => Peer.reachable(),
            });
            store.Outbox('auto').add('LordPeer|DialogLink');
            store.Outbox('auto').add('LordOther|OtherLink');
            lobby.outbox_flush();
            $mol_assert_equal(store.Outbox().items().length, 2);
            Peer.reachable(true);
            lobby.outbox_flush();
            $mol_assert_equal(store.Outbox().items().length, 0);
        },
        'Доставленная заявка переходит в отправленные и в словаре, и в старых списках'($) {
            const inbox = $giper_baza_land.make({ $ }).Data($bog_gram_inbox);
            const store = $giper_baza_land.make({ $ }).Data($bog_gram_dialogs);
            const lobby = lobby_with($, inbox, store, { deliver: () => true });
            const group = 'AAAAAAAA_BBBBBBBB';
            const owner = 'CCCCCCCC_DDDDDDDD';
            const task = lobby.task(group, owner);
            lobby.send(group, owner);
            $mol_assert_equal(lobby.queued(), [group]);
            lobby.asks_flush();
            $mol_assert_equal(lobby.asks()[group], { owner, state: 'sent' });
            $mol_assert_equal(store.Asks().items().length, 0);
            $mol_assert_equal(store.Asked().items().map(String), [task]);
        },
        async 'Заявка собирается и разбирается, мусор и подложенный ключ отсекаются'($) {
            const lobby = $bog_gram_lobby.make({ $ });
            const guest = await $.$giper_baza_auth._generate();
            const other = await $.$giper_baza_auth._generate();
            const lord = guest.pass().lord().str;
            const key = guest.pass().toString();
            const group = new $giper_baza_link(lord + '_KJhgFdSa').str;
            const entry = lobby.entry(group, lord, key);
            $mol_assert_equal(entry, group + '|' + lord + '|' + key);
            const ask = lobby.parse(entry);
            $mol_assert_equal(ask?.group, group);
            $mol_assert_equal(ask?.lord, lord);
            $mol_assert_equal($bog_gram_pass.verified(ask.lord, ask.pass)?.lord().str, lord);
            $mol_assert_equal(lobby.parse(''), null);
            $mol_assert_equal(lobby.parse('ТолькоГруппа'), null);
            $mol_assert_equal(lobby.parse(group + '|' + lord), null);
            $mol_assert_equal(lobby.parse(group + '|' + lord + '|' + key + '|лишнее'), null);
            $mol_assert_equal(lobby.parse('||'), null);
            $mol_assert_equal(lobby.parse(group + '||' + key), null);
            const junk = lobby.parse(lobby.entry(group, lord, 'не ключ'));
            $mol_assert_equal(junk?.pass, 'не ключ');
            $mol_assert_equal($bog_gram_pass.verified(junk.lord, junk.pass), null);
            const forged = lobby.parse(lobby.entry(group, lord, other.pass().toString()));
            $mol_assert_equal($bog_gram_pass.verified(forged.lord, forged.pass), null);
            const swapped = lobby.parse(lobby.entry(group, other.pass().lord().str, key));
            $mol_assert_equal($bog_gram_pass.verified(swapped.lord, swapped.pass), null);
        },
        async 'Заявки живут отдельным списком лобби и снимаются решением'($) {
            const owner = await $.$giper_baza_auth._generate();
            const guest = await $.$giper_baza_auth._generate();
            const lobby = $bog_gram_lobby.make({ $ });
            const group = new $giper_baza_link(owner.pass().lord().str + '_KJhgFdSa').str;
            const entry = lobby.entry(group, guest.pass().lord().str, guest.pass().toString());
            const inbox = $giper_baza_land.make({ $, auth: () => owner });
            const ops = {
                ask() {
                    inbox.Data($bog_gram_inbox).Joins('auto').add(entry);
                    return true;
                },
                drop() {
                    inbox.Data($bog_gram_inbox).Joins('auto').cut(entry);
                    return true;
                },
                read() {
                    const data = inbox.Data($bog_gram_inbox);
                    return {
                        joins: data.Joins().items().map(String),
                        invites: (data.Invites()?.items() ?? []).length,
                    };
                },
            };
            await $mol_wire_async(ops).ask();
            const filled = await $mol_wire_async(ops).read();
            $mol_assert_equal(filled.joins.includes(entry), true);
            $mol_assert_equal(filled.invites, 0);
            await $mol_wire_async(ops).drop();
            $mol_assert_equal((await $mol_wire_async(ops).read()).joins.length, 0);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Ссылка несёт лорд и ключ, ключ адрес не ломает'($) {
            const auth = await $.$giper_baza_auth._generate();
            const lord = auth.pass().lord().str;
            const key = auth.pass().toString();
            const invite = $bog_gram_invite.make({ $ });
            $mol_assert_equal(invite.uri(lord, key), $.$mol_state_arg.make_link({ invite: lord, key }));
            $mol_assert_equal(invite.uri(lord, ''), $.$mol_state_arg.make_link({ invite: lord }));
            $mol_assert_equal(invite.uri('', ''), '');
            $mol_assert_equal(encodeURIComponent(key), key);
        },
        'Своя и битая ссылки диалога не заводят, знакомый открывается'($) {
            const invite = $bog_gram_invite.make({ $ });
            const my = 'LordMine';
            const other = 'LordOthr_Bbbbbbbb';
            $mol_assert_equal(invite.plan(my, my, ''), 'skip');
            $mol_assert_equal(invite.plan('', my, ''), 'skip');
            $mol_assert_equal(invite.plan('не ссылка', my, ''), 'bad');
            $mol_assert_equal(invite.plan(other, my, 'DialogLink'), 'open');
            $mol_assert_equal(invite.plan(other, my, ''), 'start');
        },
        'Ожидание ключа собеседника объясняется на экране'($) {
            const invite = $bog_gram_invite.make({ $ });
            const other = 'LordOthr_Bbbbbbbb';
            $mol_assert_equal(invite.plate(), '');
            invite.pending(other);
            $mol_assert_equal(invite.plate(), 'Открываем диалог — ищем ключ собеседника');
            invite.late(other);
            $mol_assert_equal(invite.plate().startsWith('Ключ собеседника не нашёлся'), true);
            invite.pending('LordThrd_Cccccccc');
            $mol_assert_equal(invite.plate(), 'Открываем диалог — ищем ключ собеседника');
            invite.lost('мусор');
            $mol_assert_equal(invite.plate(), 'Ссылка на диалог битая — попросите свежую');
            invite.drop();
            $mol_assert_equal(invite.plate(), '');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Подпись переживает перезапуск фибры и не заводит новую на каждом заходе'($) {
            const auth = await $.$giper_baza_auth._generate();
            const lord = auth.pass().lord().str;
            class Notify extends $bog_gram_notify {
                static $ = $.$mol_ambient({
                    $giper_baza_auth: { current: () => auth },
                });
            }
            const later = {
                async tick() {
                    await Promise.resolve();
                    return true;
                },
            };
            const proofs = [];
            const proof = await $mol_wire_async(() => {
                const proof = Notify.signed('subscribe', lord, 'Monitor', 'https://push.example/1');
                proofs.push(proof);
                $mol_wire_sync(later).tick();
                return proof;
            })();
            $mol_assert_equal(proofs.length, 2);
            $mol_assert_equal(proofs[0], proof);
        },
        async 'Подпись запроса к демону сходится с ключом владельца и ломается от подмены'($) {
            const auth = await $.$giper_baza_auth._generate();
            const other = await $.$giper_baza_auth._generate();
            const lord = auth.pass().lord().str;
            class Notify extends $bog_gram_notify {
                static $ = $.$mol_ambient({
                    $giper_baza_auth: { current: () => auth },
                });
            }
            const proof = await $mol_wire_async(Notify).signed('subscribe', lord, 'Monitor', 'https://push.example/1');
            $mol_assert_equal($giper_baza_auth_pass.from(proof.pass).lord().str, lord);
            const sign = $mol_base64_url_decode(proof.sign);
            const text = (monitor) => $mol_charset_encode(Notify.proof('subscribe', lord, monitor, 'https://push.example/1', proof.time));
            $mol_assert_equal(await auth.pass().auditor().verify(text('Monitor'), sign), true);
            $mol_assert_equal(await auth.pass().auditor().verify(text('Stolen'), sign), false);
            $mol_assert_equal(await other.pass().auditor().verify(text('Monitor'), sign), false);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    class Alerts_switch extends $mol_object {
        static on(next) {
            return next ?? false;
        }
    }
    __decorate([
        $mol_mem
    ], Alerts_switch, "on", null);
    $mol_test({
        async 'Подписка поднимается один раз, даже когда сама включает уведомления'($) {
            let applied = 0;
            const alerts = $bog_gram_alerts.make({ $,
                supported: () => true,
                permission: () => 'granted',
                on: (next) => Alerts_switch.on(next),
                off: () => false,
                asked: () => false,
                Account: () => ({ monitor_link: () => 'Monitor', my_lord: () => 'Lord' }),
                apply: (on) => {
                    ++applied;
                    Promise.resolve().then(() => alerts.on(on));
                    return on;
                },
            });
            alerts.auto();
            await Promise.resolve();
            await Promise.resolve();
            $mol_assert_equal(applied, 1);
            $mol_assert_equal(alerts.on(), true);
            alerts.auto();
            await Promise.resolve();
            $mol_assert_equal(applied, 1);
        },
        'Уведомления включаются сами, но выключенные руками не возвращаются'($) {
            const alerts = $bog_gram_alerts.make({ $ });
            const plan = (permission, on, off, asked) => alerts.plan(true, permission, on, off, asked);
            $mol_assert_equal(plan('granted', false, false, false), 'subscribe');
            $mol_assert_equal(plan('default', false, false, false), 'ask');
            $mol_assert_equal(plan('default', false, false, true), 'skip');
            $mol_assert_equal(plan('denied', false, false, false), 'skip');
            $mol_assert_equal(plan('granted', true, false, false), 'subscribe');
            $mol_assert_equal(plan('denied', true, false, false), 'skip');
            $mol_assert_equal(plan('granted', false, true, false), 'skip');
            $mol_assert_equal(plan('default', false, true, false), 'skip');
            $mol_assert_equal(alerts.plan(false, 'granted', false, false, false), 'skip');
        },
        'Подпись под тумблером говорит, что будет дальше'($) {
            const make = (supported, permission, on, off) => $bog_gram_alerts.make({ $,
                supported: () => supported,
                permission: () => permission,
                on: () => on,
                off: () => off,
            });
            $mol_assert_equal(make(false, 'default', false, false).status(), 'Не поддерживается этим браузером');
            $mol_assert_equal(make(true, 'denied', false, false).status(), 'Запрещены в браузере');
            $mol_assert_equal(make(true, 'granted', true, false).status(), 'Уведомления включены');
            $mol_assert_equal(make(true, 'default', false, true).status(), 'Выключены');
            $mol_assert_equal(make(true, 'default', false, false).status(), 'Спросим разрешение, когда откроете диалог');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'a segment per screen, marked where the reader is'($) {
            const pager = new $.$bog_kit_pager;
            pager.$ = $;
            pager.count = () => 3;
            pager.current = () => 1;
            $mol_assert_equal(pager.segments().length, 3);
            $mol_assert_equal(pager.segment_on(0), false);
            $mol_assert_equal(pager.segment_on(1), true);
            $mol_assert_equal(pager.segment_on(2), false);
        },
        /*
            The widths are taken a frame after the columns are laid out, so they
            are empty on the first paint and one short after every step deeper.
            A bar that counted its segments from them came out blank on a phone
            and left the current screen unmarked on a desktop, because the index
            ran past the end. The count comes from the route instead.
        */
        'segments do not wait for the columns to be measured'($) {
            const pager = new $.$bog_kit_pager;
            pager.$ = $;
            pager.count = () => 3;
            pager.spans = () => [];
            pager.span_total = () => 0;
            pager.current = () => 2;
            $mol_assert_equal(pager.segments().length, 3);
            $mol_assert_equal(pager.segment_on(2), true);
            $mol_assert_equal(pager.segment_weight(0), '1');
            $mol_assert_equal(pager.width_style(), '100%');
        },
        /*
            Weights go out as strings. $mol_dom_render_styles appends `px` to any
            numeric inline value, so a numeric weight lands as `flex-grow: 450px`,
            is dropped as invalid, and every segment ends up zero wide — right
            colours, right bar length, nothing to see.
        */
        'measured columns set the segment widths'($) {
            const pager = new $.$bog_kit_pager;
            pager.$ = $;
            pager.count = () => 3;
            pager.spans = () => [450, 355, 585];
            pager.span_total = () => 1394;
            $mol_assert_equal(pager.segment_weight(0), '450');
            $mol_assert_equal(pager.segment_weight(2), '585');
            $mol_assert_equal(pager.width_style(), '1394px');
        },
        'one screen is not a sequence'($) {
            const pager = new $.$bog_kit_pager;
            pager.$ = $;
            pager.count = () => 1;
            $mol_assert_equal(pager.segments().length, 0);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Длительность показывается минутами и секундами, доли округляются'() {
            $mol_assert_equal($bog_gram_voice.stamp(0), '0:00');
            $mol_assert_equal($bog_gram_voice.stamp(7), '0:07');
            $mol_assert_equal($bog_gram_voice.stamp(59), '0:59');
            $mol_assert_equal($bog_gram_voice.stamp(60), '1:00');
            $mol_assert_equal($bog_gram_voice.stamp(125), '2:05');
            $mol_assert_equal($bog_gram_voice.stamp(5 * 60), '5:00');
            $mol_assert_equal($bog_gram_voice.stamp(7.4), '0:07');
            $mol_assert_equal($bog_gram_voice.stamp(7.6), '0:08');
            $mol_assert_equal($bog_gram_voice.stamp(-5), '0:00');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        function key(mods = {}) {
            const event = {
                keyCode: $mol_keyboard_code.enter,
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                defaultPrevented: false,
                preventDefault() { event.defaultPrevented = true; },
                ...mods,
            };
            return event;
        }
        function make($, fine) {
            let sent = 0;
            const write = $bog_gram_write.make({ $, enter_sends: () => fine, send: () => (++sent, null) });
            const press = (event) => {
                write.Edit().Submit().keydown(event);
                write.press(event);
                return event;
            };
            return { write, press, sent: () => sent };
        }
        $mol_test({
            'Enter отправляет, Shift+Enter переносит строку'($) {
                const { write, press, sent } = make($, true);
                write.value('Привет');
                const shift = press(key({ shiftKey: true }));
                $mol_assert_equal(sent(), 0);
                $mol_assert_equal(shift.defaultPrevented, false);
                const enter = press(key());
                $mol_assert_equal(sent(), 1);
                $mol_assert_equal(enter.defaultPrevented, true);
            },
            'Ctrl+Enter и Cmd+Enter вставляют перевод строки на месте курсора'($) {
                const { write, press, sent } = make($, true);
                write.value('Приветмир');
                write.selection([6, 6]);
                const ctrl = press(key({ ctrlKey: true }));
                $mol_assert_equal(write.value(), 'Привет\nмир');
                $mol_assert_equal(write.selection(), [7, 7]);
                $mol_assert_equal(ctrl.defaultPrevented, true);
                write.selection([0, 6]);
                press(key({ metaKey: true }));
                $mol_assert_equal(write.value(), '\n\nмир');
                $mol_assert_equal(sent(), 0);
            },
            'На тач-экране Enter переносит строку, отправка кнопкой'($) {
                const { write, press, sent } = make($, false);
                write.value('Привет');
                const enter = press(key());
                $mol_assert_equal(sent(), 0);
                $mol_assert_equal(enter.defaultPrevented, false);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    async function $bog_gram_call_room_pair($) {
        const king = await $.$giper_baza_auth._generate();
        const auth_a = await $.$giper_baza_auth._generate();
        const auth_b = await $.$giper_baza_auth._generate();
        const land0 = $giper_baza_land.make({ $, auth: () => king });
        land0.give(auth_a.pass(), $giper_baza_rank_post('just'));
        land0.give(auth_b.pass(), $giper_baza_rank_post('just'));
        const land_a = $giper_baza_land.make({ $, link: () => land0.link(), auth: () => auth_a });
        await $mol_wire_async(land_a).units_steal(land0);
        const land_b = $giper_baza_land.make({ $, link: () => land0.link(), auth: () => auth_b });
        await $mol_wire_async(land_b).units_steal(land0);
        const time = 100_000;
        const room = (land, auth, name) => $bog_gram_call_room.make({
            $,
            land: () => land,
            lord: () => auth.pass().lord().str,
            name: () => name,
            now: () => time,
            cam_able: () => true,
        });
        const room_a = room(land_a, auth_a, 'Аня');
        const room_b = room(land_b, auth_b, 'Боря');
        return {
            room,
            land_a,
            auth_a,
            room_a,
            room_b,
            swap: async () => {
                await $mol_wire_async(land_a).units_steal(land_b);
                await $mol_wire_async(land_b).units_steal(land_a);
            },
        };
    }
    $_1.$bog_gram_call_room_pair = $bog_gram_call_room_pair;
    $mol_test({
        async 'Вошедший виден собеседнику по имени, своё место в собеседниках не числится'($) {
            const { room_a, room_b, swap } = await $bog_gram_call_room_pair($);
            room_a.join();
            room_a.beat();
            room_b.join();
            room_b.beat();
            await swap();
            $mol_assert_equal(room_b.mates(), [room_a.seat()]);
            $mol_assert_equal(room_a.mates(), [room_b.seat()]);
            $mol_assert_equal(room_b.seat_name(room_a.seat()), 'Аня');
            $mol_assert_equal(room_a.seats_alive().length, 2);
        },
        async 'Вышедший пропадает из звонка у собеседника'($) {
            const { room_a, room_b, swap } = await $bog_gram_call_room_pair($);
            room_a.join();
            room_a.beat();
            room_b.join();
            room_b.beat();
            await swap();
            room_a.leave();
            await swap();
            $mol_assert_equal(room_b.mates(), []);
            $mol_assert_equal(room_a.joined(), false);
        },
        async 'Замолчавший без выхода считается ушедшим через окно присутствия'($) {
            const { room_a, room_b, swap } = await $bog_gram_call_room_pair($);
            room_a.join();
            room_a.beat();
            await swap();
            $mol_assert_equal(room_b.seats_alive(), [room_a.seat()]);
            const room_c = $bog_gram_call_room.make({
                $,
                land: () => room_b.land(),
                now: () => 100_000 + $bog_gram_call_room.alive_span + 1,
            });
            $mol_assert_equal(room_c.seats_alive(), []);
        },
        async 'Повторный вход занимает новое место, чтобы пары сигналов не смешивались'($) {
            const { room_a } = await $bog_gram_call_room_pair($);
            room_a.join();
            const first = room_a.seat();
            room_a.leave();
            room_a.join();
            $mol_assert_unique(first, room_a.seat());
        },
        async 'Предложение и ответ доходят через ленд по общему ключу пары'($) {
            const { room_a, room_b, swap } = await $bog_gram_call_room_pair($);
            room_a.join();
            room_b.join();
            const a = room_a.seat();
            const b = room_b.seat();
            $mol_assert_unique($bog_gram_call_room.offerer(a, b), $bog_gram_call_room.offerer(b, a));
            $mol_assert_equal($bog_gram_call_room.pair(a, b), $bog_gram_call_room.pair(b, a));
            const offerer = $bog_gram_call_room.offerer(a, b) ? room_a : room_b;
            const answerer = offerer === room_a ? room_b : room_a;
            const key = $bog_gram_call_room.pair(a, b);
            offerer.signal_put('Offers', key, JSON.stringify({ id: '0.X', sdp: 'offer' }));
            await swap();
            $mol_assert_equal($bog_gram_call_room.signal_parse(answerer.signal('Offers', key)), { id: '0.X', sdp: 'offer' });
            answerer.signal_put('Answers', key, JSON.stringify({ id: '0.X', sdp: 'answer' }));
            await swap();
            $mol_assert_equal($bog_gram_call_room.signal_parse(offerer.signal('Answers', key)), { id: '0.X', sdp: 'answer' });
        },
        async 'Повторный вход того же человека заменяет прежнее место, а не добавляет второе'($) {
            const { room, land_a, auth_a, room_a, room_b, swap } = await $bog_gram_call_room_pair($);
            room_a.join();
            room_a.beat();
            const twin = room(land_a, auth_a, 'Аня');
            twin.join();
            twin.beat();
            room_b.join();
            room_b.beat();
            await swap();
            $mol_assert_equal(room_b.mates(), [twin.seat()]);
            $mol_assert_equal(room_b.seats_alive().length, 2);
            $mol_assert_equal(room_a.joined(), false);
            $mol_assert_equal(twin.joined(), true);
            $mol_assert_equal(twin.mates(), [room_b.seat()]);
        },
        async 'Из двух живых мест одного человека в звонке остаётся последнее'($) {
            const { room, room_a, room_b, auth_a, swap } = await $bog_gram_call_room_pair($);
            room_a.join();
            room_a.beat();
            room_a.seat_pawn(room_a.seat()).Joined('auto').val(1);
            const twin = room(room_b.land(), auth_a, 'Аня');
            twin.join();
            twin.beat();
            await swap();
            $mol_assert_equal(room_a.seat_pawn(room_a.seat()).Left()?.val() ?? null, null);
            $mol_assert_equal(room_b.seats_alive(), [twin.seat()]);
            $mol_assert_equal(room_a.joined(), false);
            $mol_assert_equal(twin.joined(), true);
        },
        'Сводка соединения считает кадры, битрейт, потери и задержку'() {
            const entries = (time, bytes) => [
                { type: 'transport', selectedCandidatePairId: 'P' },
                { type: 'candidate-pair', id: 'P', currentRoundTripTime: 0.042 },
                { type: 'candidate-pair', id: 'Q', currentRoundTripTime: 9 },
                { type: 'inbound-rtp', kind: 'video', timestamp: time, bytesReceived: bytes, packetsLost: 1, packetsReceived: 99, framesPerSecond: 29.7, frameWidth: 640, frameHeight: 480 },
                { type: 'inbound-rtp', kind: 'audio', timestamp: time, bytesReceived: 0, packetsLost: 0, packetsReceived: 100 },
            ];
            const first = $bog_gram_call_peer.stats_sum(entries(1_000, 0), null);
            $mol_assert_equal(first.kbps, 0);
            const next = $bog_gram_call_peer.stats_sum(entries(3_000, 250_000), first);
            $mol_assert_equal([next.fps, next.width, next.height, next.kbps, next.loss, next.rtt], [30, 640, 480, 1000, 0.5, 42]);
        },
        'Испорченный сигнал не ломает разбор'() {
            $mol_assert_equal($bog_gram_call_room.signal_parse(''), null);
            $mol_assert_equal($bog_gram_call_room.signal_parse('{"id":1}'), null);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            async 'Крестик выходит из звонка и закрывает страницу'($) {
                const { room_a, room_b, swap } = await $bog_gram_call_room_pair($);
                let closed = 0;
                const call = $bog_gram_call.make({
                    $,
                    Room: () => room_a,
                    close: () => ++closed,
                });
                call.join();
                room_a.beat();
                room_b.join();
                room_b.beat();
                await swap();
                $mol_assert_equal(room_b.mates(), [room_a.seat()]);
                call.close_click({});
                await swap();
                $mol_assert_equal(closed, 1);
                $mol_assert_equal(call.joined(), false);
                $mol_assert_equal(room_b.mates(), []);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($) {
    $mol_test({
        'Большая сторона вписывается в предел с сохранением пропорций'() {
            $mol_assert_equal($bog_gram_shrink.fit(4000, 3000, 1600), { width: 1600, height: 1200 });
            $mol_assert_equal($bog_gram_shrink.fit(3000, 4000, 1600), { width: 1200, height: 1600 });
            $mol_assert_equal($bog_gram_shrink.fit(2000, 2000, 1600), { width: 1600, height: 1600 });
        },
        'Кадр мельче предела не растягивается, узкая полоска не схлопывается'() {
            $mol_assert_equal($bog_gram_shrink.fit(320, 200, 1600), { width: 320, height: 200 });
            $mol_assert_equal($bog_gram_shrink.fit(4000, 1, 1600), { width: 1600, height: 1 });
        },
        'Картинкой считается только файл с типом image'() {
            $mol_assert_equal($bog_gram_shrink.image_is(new $mol_blob([], { type: 'image/webp' })), true);
            $mol_assert_equal($bog_gram_shrink.image_is(new $mol_blob([], { type: 'text/plain' })), false);
        },
        'Без перекодирования уезжают только форматы, которые покажет любой браузер'() {
            $mol_assert_equal($bog_gram_shrink.portable('image/jpeg'), true);
            $mol_assert_equal($bog_gram_shrink.portable('image/webp'), true);
            $mol_assert_equal($bog_gram_shrink.portable('image/heic'), false);
            $mol_assert_equal($bog_gram_shrink.portable('image/tiff'), false);
        },
        'Файл без типа узнаётся по расширению, а чужой тип расширением не перебить'() {
            $mol_assert_equal($bog_gram_shrink.image_is(new File([], 'IMG_0001.HEIC')), true);
            $mol_assert_equal($bog_gram_shrink.image_is(new File([], 'photo.jpeg', { type: 'application/octet-stream' })), true);
            $mol_assert_equal($bog_gram_shrink.image_is(new File([], 'notes.txt')), false);
            $mol_assert_equal($bog_gram_shrink.image_is(new File([], 'jpg')), false);
            $mol_assert_equal($bog_gram_shrink.image_is(new File([], 'fake.jpg', { type: 'application/pdf' })), false);
        },
        'Настоящий тип берётся из первых байт'() {
            const bytes = (...parts) => new Uint8Array(parts.flatMap(part => typeof part === 'string' ? [...part].map(char => char.charCodeAt(0)) : part));
            $mol_assert_equal($bog_gram_shrink.sniff(bytes([0xFF, 0xD8, 0xFF, 0xE1])), 'image/jpeg');
            $mol_assert_equal($bog_gram_shrink.sniff(bytes([0x89], 'PNG', [13, 10, 26, 10])), 'image/png');
            $mol_assert_equal($bog_gram_shrink.sniff(bytes('GIF89a')), 'image/gif');
            $mol_assert_equal($bog_gram_shrink.sniff(bytes('RIFF', [0, 0, 0, 0], 'WEBPVP8 ')), 'image/webp');
            $mol_assert_equal($bog_gram_shrink.sniff(bytes([0, 0, 0, 24], 'ftypheic')), 'image/heic');
            $mol_assert_equal($bog_gram_shrink.sniff(bytes([0, 0, 0, 24], 'ftypmif1')), 'image/heif');
            $mol_assert_equal($bog_gram_shrink.sniff(bytes([0, 0, 0, 24], 'ftypavif')), 'image/avif');
            $mol_assert_equal($bog_gram_shrink.sniff(bytes([0, 0, 0, 24], 'ftypisom')), '');
            $mol_assert_equal($bog_gram_shrink.sniff(bytes('%PDF-1.7')), '');
            $mol_assert_equal($bog_gram_shrink.sniff(bytes()), '');
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        'Скрытая вкладка и окно без фокуса не перед глазами'($) {
            const doc = { visibilityState: 'visible', hasFocus: () => true };
            class Awake extends $bog_gram_awake {
                static $ = $.$mol_ambient({ $mol_dom_context: { document: doc } });
            }
            $mol_assert_equal(Awake.now(), true);
            doc.visibilityState = 'hidden';
            $mol_assert_equal(Awake.now(), false);
            doc.visibilityState = 'visible';
            doc.hasFocus = () => false;
            $mol_assert_equal(Awake.now(), false);
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            'Открывается с первого непрочитанного чужого сообщения'($) {
                const chat = $bog_gram_chat.make({ $ });
                const session = $giper_baza_land.make({ $ }).Data($bog_gram_session);
                const write = (moment, author) => {
                    const message = session.Messages('auto').make(null);
                    message.Moment('auto')?.val(moment);
                    message.Author('auto')?.val(author);
                    return message;
                };
                const list = [
                    write(1000, 'Peer'),
                    write(2000, 'Me'),
                    write(3000, 'Peer'),
                    write(4000, 'Peer'),
                ];
                const id = (index) => list[index].link().str;
                $mol_assert_equal(chat.unread_first(list, 'Me', 2000), id(2));
                $mol_assert_equal(chat.unread_first(list.slice(0, 2), 'Me', 1000), '');
                $mol_assert_equal(chat.unread_first(list, 'Me', 4000), '');
                $mol_assert_equal(chat.unread_first(list, 'Me', 0), id(0));
                list[2].Deleted('auto')?.val(5000);
                $mol_assert_equal(chat.unread_first(list, 'Me', 2000), id(3));
            },
            'Ответ вызывается двумя тапами по одному пузырю, а не по разным'($) {
                const chat = $bog_gram_chat.make({ $ });
                $mol_assert_equal(chat.message_double_tap('a', 1000), false);
                $mol_assert_equal(chat.message_double_tap('a', 1200), true);
                $mol_assert_equal(chat.message_double_tap('a', 1300), false);
                $mol_assert_equal(chat.message_double_tap('b', 1400), false);
                $mol_assert_equal(chat.message_double_tap('b', 2000), false);
            },
            'В группе вместо галочек — сколько человек прочитало'($) {
                const chat = $bog_gram_chat.make({ $ });
                const mates = ['LordA', 'LordB', 'LordC'];
                const reads = { LordA: 3000, LordB: 1000, LordC: 0 };
                $mol_assert_equal(chat.read_tally(reads, mates, 1000), 2);
                $mol_assert_equal(chat.read_tally(reads, mates, 3000), 1);
                $mol_assert_equal(chat.read_tally(reads, mates, 4000), 0);
                $mol_assert_equal(chat.read_tally({ ...reads, LordGone: 9000 }, mates, 3000), 1);
                $mol_assert_equal(chat.read_tally({}, mates, 1000), 0);
                $mol_assert_equal(chat.read_tally(reads, [], 1000), 0);
            },
            'Отпускание над крестиком отменяет запись, мимо него — нет'($) {
                const chat = $bog_gram_chat.make({ $ });
                chat.cancel_rect = () => ({ left: 100, right: 200, top: 10, bottom: 50, width: 100, height: 40 });
                $mol_assert_equal(chat.voice_on_cancel({ clientX: 150, clientY: 30 }), true);
                $mol_assert_equal(chat.voice_on_cancel({ clientX: 250, clientY: 30 }), false);
                $mol_assert_equal(chat.voice_on_cancel({ clientX: 150, clientY: 60 }), false);
                $mol_assert_equal(chat.voice_on_cancel(), false);
            },
            'Кадр без размеров — квадрат на полный предел, а не точка'($) {
                const session = $giper_baza_land.make({ $ }).Data($bog_gram_session);
                const bare = session.Messages('auto').make(null);
                const zero = session.Messages('auto').make(null);
                zero.Image_width('auto')?.val(0);
                zero.Image_height('auto')?.val(0);
                const wide = session.Messages('auto').make(null);
                wide.Image_width('auto')?.val(1600);
                wide.Image_height('auto')?.val(1200);
                const pawns = new Map([bare, zero, wide].map(message => [message.link().str, message]));
                const chat = $bog_gram_chat.make({ $, message_pawn: (id) => pawns.get(id) ?? null });
                for (const message of [bare, zero]) {
                    $mol_assert_equal(chat.message_shot_width(message.link().str), '15.00rem');
                    $mol_assert_equal(chat.message_shot_ratio(message.link().str), '240 / 240');
                }
                $mol_assert_equal(chat.message_shot_width(wide.link().str), '15.00rem');
                $mol_assert_equal(chat.message_shot_ratio(wide.link().str), '1600 / 1200');
            },
            'Без ключа участника фото и голосовое не уходят молча, а называют, чей ключ не доехал'($) {
                const session = $giper_baza_land.make({ $ }).Data($bog_gram_session);
                const talk = $bog_gram_talk.make({ $, session: () => session, mates: () => ['LordKnown', 'LordLost'], saved_is: () => false });
                const pass = {};
                const people = $bog_gram_people.make({ $,
                    pass_of: (lord) => lord === 'LordKnown' ? pass : null,
                    label: (lord) => lord === 'LordLost' ? 'Борис' : 'Алиса',
                });
                const chat = $bog_gram_chat.make({ $, dialog: () => 'Dialog', Talk: () => talk, People: () => people });
                $mol_assert_equal(chat.image_send(new File([], 'a.jpg', { type: 'image/jpeg' })), '');
                $mol_assert_equal(chat.voice_hint(), 'Фото не отправлено: не доехал ключ — Борис. Отправьте ещё раз чуть позже');
                chat.voice_hint('');
                $mol_assert_equal(chat.voice_send({}), '');
                $mol_assert_equal(chat.voice_hint(), 'Голосовое не отправлено: не доехал ключ — Борис. Отправьте ещё раз чуть позже');
                $mol_assert_equal(session.Messages()?.items().length ?? 0, 0);
            },
            'Без ключа участника звонок не начинается молча, а называет, чей ключ не доехал'($) {
                const session = $giper_baza_land.make({ $ }).Data($bog_gram_session);
                const talk = $bog_gram_talk.make({ $, session: () => session, mates: () => ['LordKnown', 'LordLost'], saved_is: () => false });
                const pass = {};
                const people = $bog_gram_people.make({ $,
                    pass_of: (lord) => lord === 'LordKnown' ? pass : null,
                    label: (lord) => lord === 'LordLost' ? 'Борис' : 'Алиса',
                });
                let opened = 0;
                const chat = $bog_gram_chat.make({ $, dialog: () => 'Dialog', Talk: () => talk, People: () => people, call_open: () => ++opened });
                $mol_assert_equal(chat.call_send(), '');
                $mol_assert_equal(chat.voice_hint(), 'Звонок не начат: не доехал ключ — Борис. Позвоните ещё раз чуть позже');
                $mol_assert_equal(session.Messages()?.items().length ?? 0, 0);
                $mol_assert_equal(opened, 0);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    $mol_test({
        async 'Молчащий мастер в начале списка не задерживает подключение к живому'($) {
            const made = [];
            class Fake {
                url;
                binaryType = '';
                closed = false;
                onopen = null;
                onerror = null;
                onclose = null;
                onmessage = null;
                constructor(url) {
                    this.url = url;
                    made.push(this);
                    if (url.includes('alive'))
                        setTimeout(() => this.onopen?.(), 5);
                }
                send() { }
                close() { this.closed = true; }
            }
            class Yard extends $bog_yard {
                static stagger = 10;
                static masters() {
                    return ['https://silent.example/', 'https://alive.example/'];
                }
            }
            const context = Object.create($);
            context.$mol_dom_context = Object.assign(Object.create($.$mol_dom_context), { WebSocket: Fake });
            context.$giper_baza_yard = Yard;
            const yard = Yard.make({ $: context });
            const began = Date.now();
            const port = await $mol_wire_async(yard).master();
            const spent = Date.now() - began;
            $mol_assert_equal(yard.master_cursor(), 1);
            $mol_assert_equal(port.socket.url, 'wss://alive.example/');
            $mol_assert_equal(made[0].closed, true);
            $mol_assert_equal(spent < 500, true);
            port.destructor();
        },
    });
})($ || ($ = {}));

;
"use strict";
var $;
(function ($_1) {
    var $$;
    (function ($$) {
        $mol_test({
            async 'Тап по диалогу открывает его сразу'($) {
                const app = $bog_gram.make({ $ });
                await $mol_wire_async(app).dialog_select('dialog');
                $mol_assert_equal(app.dialog_current(), 'dialog');
            },
            'Полоса отмечает панель, которая перед глазами'($) {
                const app = $bog_gram.make({ $ });
                const frames = [[0, 390], [390, 390], [780, 390]];
                $mol_assert_equal(app.page_at(frames, 195), 0);
                $mol_assert_equal(app.page_at(frames, 390 + 195), 1);
                $mol_assert_equal(app.page_at(frames, 780 + 195), 2);
                $mol_assert_equal(app.page_at(frames, 5000), 2);
            },
            'Пока все панели влезают, полосы нет'($) {
                const app = $bog_gram.make({ $ });
                app.pages_overflow = () => false;
                $mol_assert_equal(app.pager_count(), 0);
            },
        });
    })($$ = $_1.$$ || ($_1.$$ = {}));
})($ || ($ = {}));


//# sourceMappingURL=web.test.js.map
