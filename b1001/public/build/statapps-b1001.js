
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* ../../svelte-plots/src/Axes.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$3 = "../../svelte-plots/src/Axes.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let svg;
    	let svg_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			attr_dev(svg, "class", svg_class_value = "axes  " + ("axes_" + /*$scale*/ ctx[1]) + " svelte-1x0l6z7");
    			add_location(svg, file$3, 190, 3, 5874);
    			attr_dev(div, "class", "axes-wrapper svelte-1x0l6z7");
    			add_location(div, file$3, 189, 0, 5818);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			/*div_binding*/ ctx[8](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$scale*/ 2 && svg_class_value !== (svg_class_value = "axes  " + ("axes_" + /*$scale*/ ctx[1]) + " svelte-1x0l6z7")) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function niceNum(localRange, round) {
    	const exponent = Math.floor(Math.log10(localRange));
    	const fraction = localRange / Math.pow(10, exponent);
    	let niceFraction;

    	if (round) {
    		if (fraction < 1.5) niceFraction = 1; else if (fraction < 3) niceFraction = 2; else if (fraction < 7) niceFraction = 5; else niceFraction = 10;
    	} else {
    		if (fraction <= 1) niceFraction = 1; else if (fraction <= 2) niceFraction = 2; else if (fraction <= 5) niceFraction = 5; else niceFraction = 10;
    	}

    	return niceFraction * Math.pow(10, exponent);
    }

    // returns a scale category based on the plotting area size in pixels
    function getScale(width, height) {
    	if (height < 300 || width < 400) return "small";
    	if (height < 600 || width < 800) return "medium";
    	return "large";
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $scale;
    	let $width;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Axes", slots, ['default']);
    	let { limX = [undefined, undefined] } = $$props;
    	let { limY = [undefined, undefined] } = $$props;

    	// how big are margins (in pixels) between axis and plot area if axis are shown
    	const AXES_MARGIN_FACTORS = { "small": 30, "medium": 40, "large": 50 };

    	// number of ticks along axis
    	const TICK_NUM = { "small": 5, "medium": 8, "large": 12 };

    	// margin between plot elements and data labels
    	const LABELS_MARGIN = { "small": 15, "medium": 20, "large": 25 };

    	// internal parameters
    	let axesWrapper;

    	let axesMargins = [0, 0, 0, 0];

    	// reactive parameters to be shared with children via context
    	const width = writable(100); // actual width of plotting area in pixels

    	validate_store(width, "width");
    	component_subscribe($$self, width, value => $$invalidate(10, $width = value));
    	const height = writable(100); // actual height of plotting area in pixels
    	const xLim = writable(limX); // actual limits for x-axis
    	const yLim = writable(limY); // actual limits for y-axis
    	const scale = writable("medium"); // scale factor (how big the shown plot is)
    	validate_store(scale, "scale");
    	component_subscribe($$self, scale, value => $$invalidate(1, $scale = value));

    	// adds top and bottom margin if x-axis is shown
    	const addXAxisMargins = function () {
    		axesMargins[1] = 1;
    		axesMargins[3] = 1;
    	};

    	// adds left and right margins if y-axis is shown
    	const addYAxisMargins = function () {
    		axesMargins[0] = 1;
    		axesMargins[2] = 1;
    	};

    	// allows children to adjust x-axis limits
    	const adjustXAxisLimits = function (newLim) {
    		xLim.update(lim => adjustAxisLimits(lim, newLim));
    	};

    	// allows children to adjust y-axis limits
    	const adjustYAxisLimits = function (newLim) {
    		yLim.update(lim => adjustAxisLimits(lim, newLim));
    	};

    	const adjustAxisLimits = function (lim, newLim) {
    		return [
    			lim[0] === undefined || lim[0] > newLim[0]
    			? newLim[0]
    			: lim[0],
    			lim[1] === undefined || lim[1] < newLim[1]
    			? newLim[1]
    			: lim[1]
    		];
    	};

    	// rescales x-values from plot coordinates to screen (SVG) coordinates
    	const scaleX = function (x, xLim, width) {
    		if (xLim.some(v => v === undefined) || x === undefined) return undefined;
    		const margins = axesMargins.map(v => v * AXES_MARGIN_FACTORS[$scale]);
    		return x.map(x => (x - xLim[0]) / (xLim[1] - xLim[0]) * (width - margins[1] - margins[3]) + margins[1]);
    	};

    	// rescales y-values from plot coordinates to screen (SVG) coordinates
    	const scaleY = function (y, yLim, height) {
    		if (yLim.some(v => v === undefined) || y === undefined) return undefined;
    		const margins = axesMargins.map(v => v * AXES_MARGIN_FACTORS[$scale]);

    		// here we also invert (flip) the y-axis
    		return y.map(y => (yLim[1] - y) / (yLim[1] - yLim[0]) * (height - margins[0] - margins[2]) + margins[2]);
    	};

    	// computes nice tick values for axis
    	const getAxisTicks = function (ticks, lim, maxTickNum, round) {
    		// if ticks are already provided do not recompute them
    		if (ticks !== undefined) return ticks;

    		// get range as a nice number and compute min, max and steps for the tick sequence
    		const range = niceNum(lim[1] - lim[0], round);

    		const tickSpacing = niceNum(range / (maxTickNum - 1), true);
    		const tickMin = Math.ceil(lim[0] / tickSpacing) * tickSpacing;
    		const tickMax = Math.floor(lim[1] / tickSpacing) * tickSpacing;

    		// recompute maxTickNum
    		maxTickNum = Math.round(tickMax - tickMin + 1 / tickSpacing);

    		// create a sequence and return
    		ticks = [...Array(maxTickNum)].map((x, i) => tickMin + i * tickSpacing);

    		// make sure the ticks are not aligned with axes limits
    		return ticks.filter(x => x > lim[0] & x <= lim[1]);
    	};

    	// context to share with children
    	let context = {
    		// methods
    		addXAxisMargins,
    		addYAxisMargins,
    		adjustXAxisLimits,
    		adjustYAxisLimits,
    		getAxisTicks,
    		scaleX,
    		scaleY,
    		// variables
    		scale,
    		width,
    		height,
    		xLim,
    		yLim,
    		// constants
    		LABELS_MARGIN,
    		TICK_NUM
    	};

    	setContext("axes", context);

    	// plot size observer
    	var ro = new ResizeObserver(entries => {
    			for (let entry of entries) {
    				const cr = entry.contentRect;
    				width.update(x => cr.width);
    				height.update(x => cr.height);
    				console.log($width);
    				scale.update(x => getScale(cr.width, cr.height));
    			}
    		});

    	onMount(() => {
    		ro.observe(axesWrapper);
    	});

    	const writable_props = ["limX", "limY"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Axes> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			axesWrapper = $$value;
    			$$invalidate(0, axesWrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("limX" in $$props) $$invalidate(4, limX = $$props.limX);
    		if ("limY" in $$props) $$invalidate(5, limY = $$props.limY);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		setContext,
    		writable,
    		limX,
    		limY,
    		AXES_MARGIN_FACTORS,
    		TICK_NUM,
    		LABELS_MARGIN,
    		axesWrapper,
    		axesMargins,
    		width,
    		height,
    		xLim,
    		yLim,
    		scale,
    		addXAxisMargins,
    		addYAxisMargins,
    		adjustXAxisLimits,
    		adjustYAxisLimits,
    		adjustAxisLimits,
    		scaleX,
    		scaleY,
    		getAxisTicks,
    		niceNum,
    		getScale,
    		context,
    		ro,
    		$scale,
    		$width
    	});

    	$$self.$inject_state = $$props => {
    		if ("limX" in $$props) $$invalidate(4, limX = $$props.limX);
    		if ("limY" in $$props) $$invalidate(5, limY = $$props.limY);
    		if ("axesWrapper" in $$props) $$invalidate(0, axesWrapper = $$props.axesWrapper);
    		if ("axesMargins" in $$props) axesMargins = $$props.axesMargins;
    		if ("context" in $$props) context = $$props.context;
    		if ("ro" in $$props) ro = $$props.ro;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [axesWrapper, $scale, width, scale, limX, limY, $$scope, slots, div_binding];
    }

    class Axes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { limX: 4, limY: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Axes",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get limX() {
    		throw new Error("<Axes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set limX(value) {
    		throw new Error("<Axes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get limY() {
    		throw new Error("<Axes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set limY(value) {
    		throw new Error("<Axes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const Colors = {
       "AXIS_LINE": "#303030",
       "AXIS_TICK": "#606060",
       "WHITE":     "#fff",
       "BLACK":     "#000",
       "GRAY":      "#909090",
       "MIDDLEGRAY": "#dadada",
       "LIGHTGRAY": "#f0f0f0",
       "DARKGRAY":  "#606060",

       "PRIMARY": "#2266ff",
    };

    function diff(x) {
       return(x.slice(1).map( (y, i) => (y - x[i])));
    }

    function min(x) {
       return(Math.min.apply(null, x));
    }

    function max(x) {
       return(Math.max.apply(null, x));
    }

    function range(x) {
       return([min(x), max(x)]);
    }

    function mrange(x, margin) {

       if (margin < 0 || margin > 1) {
          throw "'margin' should be between 0 and 1.";
       }

       const xRange = range(x);
       const delta = (xRange[1] - xRange[0]) * margin;
       return([xRange[0] - delta, xRange[1] + delta]);
    }

    /* ../../svelte-plots/src/BarSeries.svelte generated by Svelte v3.38.2 */
    const file$2 = "../../svelte-plots/src/BarSeries.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    // (55:0) {#if x !== undefined && y !== undefined}
    function create_if_block$1(ctx) {
    	let g;
    	let each_value = /*bl*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "series series_bar svelte-14iofhy");
    			attr_dev(g, "style", /*barsStyleStr*/ ctx[10]);
    			attr_dev(g, "title", /*title*/ ctx[0]);
    			add_location(g, file$2, 55, 3, 1986);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*labelsStyleStr, showLabels, x, y, dy, labels, bl, bt, bw, bh*/ 3070) {
    				each_value = /*bl*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*title*/ 1) {
    				attr_dev(g, "title", /*title*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(55:0) {#if x !== undefined && y !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (59:6) {#if showLabels === "no"}
    function create_if_block_1(ctx) {
    	let text_1;
    	let t_value = /*labels*/ ctx[1][/*i*/ ctx[33]] + "";
    	let t;
    	let text_1_class_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "style", /*labelsStyleStr*/ ctx[11]);
    			attr_dev(text_1, "class", text_1_class_value = "labels labels_" + /*showLabels*/ ctx[2] + " svelte-14iofhy");
    			attr_dev(text_1, "x", /*x*/ ctx[3]);
    			attr_dev(text_1, "y", text_1_y_value = /*y*/ ctx[4][/*i*/ ctx[33]]);
    			attr_dev(text_1, "dy", /*dy*/ ctx[6]);
    			attr_dev(text_1, "dominant-baseline", "middle");
    			attr_dev(text_1, "text-anchor", "middle");
    			add_location(text_1, file$2, 59, 6, 2187);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*labels*/ 2 && t_value !== (t_value = /*labels*/ ctx[1][/*i*/ ctx[33]] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*showLabels*/ 4 && text_1_class_value !== (text_1_class_value = "labels labels_" + /*showLabels*/ ctx[2] + " svelte-14iofhy")) {
    				attr_dev(text_1, "class", text_1_class_value);
    			}

    			if (dirty[0] & /*x*/ 8) {
    				attr_dev(text_1, "x", /*x*/ ctx[3]);
    			}

    			if (dirty[0] & /*y*/ 16 && text_1_y_value !== (text_1_y_value = /*y*/ ctx[4][/*i*/ ctx[33]])) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty[0] & /*dy*/ 64) {
    				attr_dev(text_1, "dy", /*dy*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(59:6) {#if showLabels === \\\"no\\\"}",
    		ctx
    	});

    	return block;
    }

    // (57:3) {#each bl as bl, i}
    function create_each_block(ctx) {
    	let rect;
    	let rect_x_value;
    	let rect_y_value;
    	let rect_height_value;
    	let if_block_anchor;
    	let if_block = /*showLabels*/ ctx[2] === "no" && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(rect, "x", rect_x_value = /*bl*/ ctx[9]);
    			attr_dev(rect, "y", rect_y_value = /*bt*/ ctx[7][/*i*/ ctx[33]]);
    			attr_dev(rect, "width", /*bw*/ ctx[5]);
    			attr_dev(rect, "height", rect_height_value = /*bh*/ ctx[8][/*i*/ ctx[33]]);
    			attr_dev(rect, "class", "svelte-14iofhy");
    			add_location(rect, file$2, 57, 6, 2084);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*bl*/ 512 && rect_x_value !== (rect_x_value = /*bl*/ ctx[9])) {
    				attr_dev(rect, "x", rect_x_value);
    			}

    			if (dirty[0] & /*bt*/ 128 && rect_y_value !== (rect_y_value = /*bt*/ ctx[7][/*i*/ ctx[33]])) {
    				attr_dev(rect, "y", rect_y_value);
    			}

    			if (dirty[0] & /*bw*/ 32) {
    				attr_dev(rect, "width", /*bw*/ ctx[5]);
    			}

    			if (dirty[0] & /*bh*/ 256 && rect_height_value !== (rect_height_value = /*bh*/ ctx[8][/*i*/ ctx[33]])) {
    				attr_dev(rect, "height", rect_height_value);
    			}

    			if (/*showLabels*/ ctx[2] === "no") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(57:3) {#each bl as bl, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*x*/ ctx[3] !== undefined && /*y*/ ctx[4] !== undefined && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*x*/ ctx[3] !== undefined && /*y*/ ctx[4] !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let x;
    	let y;
    	let yzero;
    	let dy;
    	let bw;
    	let bl;
    	let bt;
    	let bh;
    	let $xLim;
    	let $axesWidth;
    	let $yLim;
    	let $axesHeight;
    	let $scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BarSeries", slots, []);
    	let { xValues } = $$props;
    	let { yValues } = $$props;
    	let { barWidth = 0.8 } = $$props;
    	let { title = "" } = $$props;
    	let { labels = yValues } = $$props;
    	let { showLabels = "hover" } = $$props; // can be "no", "hover", "always"
    	let { faceColor = Colors.PRIMARY } = $$props;
    	let { edgeColor = Colors.PRIMARY } = $$props;
    	let { labelsColor = Colors.GRAY } = $$props;

    	// TODO: implement sanity check of input parameters
    	// styles for bars and labels
    	const barsStyleStr = `fill:${faceColor};stroke:${edgeColor}`;

    	const labelsStyleStr = `fill:${labelsColor};stroke-width:0`;

    	// compute ranges for x and y values
    	const yValuesRange = mrange(yValues, showLabels === "no" ? 0.1 : 0.2);

    	const xValuesRange = mrange(xValues, 0.1);
    	xValuesRange[0] = xValuesRange[0] - barWidth * diff(xValuesRange) / xValues.length * 0.5;
    	xValuesRange[1] = xValuesRange[1] + barWidth * diff(xValuesRange) / xValues.length * 0.5;

    	// get axes context and adjust axes limits
    	const axes = getContext("axes");

    	axes.adjustXAxisLimits(xValuesRange);
    	axes.adjustYAxisLimits(yValuesRange);

    	// get reactive variables needed to compute coordinates
    	const xLim = axes.xLim;

    	validate_store(xLim, "xLim");
    	component_subscribe($$self, xLim, value => $$invalidate(23, $xLim = value));
    	const yLim = axes.yLim;
    	validate_store(yLim, "yLim");
    	component_subscribe($$self, yLim, value => $$invalidate(25, $yLim = value));
    	const axesWidth = axes.width;
    	validate_store(axesWidth, "axesWidth");
    	component_subscribe($$self, axesWidth, value => $$invalidate(24, $axesWidth = value));
    	const axesHeight = axes.height;
    	validate_store(axesHeight, "axesHeight");
    	component_subscribe($$self, axesHeight, value => $$invalidate(26, $axesHeight = value));
    	const scale = axes.scale;
    	validate_store(scale, "scale");
    	component_subscribe($$self, scale, value => $$invalidate(28, $scale = value));

    	const writable_props = [
    		"xValues",
    		"yValues",
    		"barWidth",
    		"title",
    		"labels",
    		"showLabels",
    		"faceColor",
    		"edgeColor",
    		"labelsColor"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BarSeries> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("xValues" in $$props) $$invalidate(17, xValues = $$props.xValues);
    		if ("yValues" in $$props) $$invalidate(18, yValues = $$props.yValues);
    		if ("barWidth" in $$props) $$invalidate(19, barWidth = $$props.barWidth);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("labels" in $$props) $$invalidate(1, labels = $$props.labels);
    		if ("showLabels" in $$props) $$invalidate(2, showLabels = $$props.showLabels);
    		if ("faceColor" in $$props) $$invalidate(20, faceColor = $$props.faceColor);
    		if ("edgeColor" in $$props) $$invalidate(21, edgeColor = $$props.edgeColor);
    		if ("labelsColor" in $$props) $$invalidate(22, labelsColor = $$props.labelsColor);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		Colors,
    		mrange,
    		diff,
    		xValues,
    		yValues,
    		barWidth,
    		title,
    		labels,
    		showLabels,
    		faceColor,
    		edgeColor,
    		labelsColor,
    		barsStyleStr,
    		labelsStyleStr,
    		yValuesRange,
    		xValuesRange,
    		axes,
    		xLim,
    		yLim,
    		axesWidth,
    		axesHeight,
    		scale,
    		x,
    		$xLim,
    		$axesWidth,
    		y,
    		$yLim,
    		$axesHeight,
    		yzero,
    		dy,
    		$scale,
    		bw,
    		bl,
    		bt,
    		bh
    	});

    	$$self.$inject_state = $$props => {
    		if ("xValues" in $$props) $$invalidate(17, xValues = $$props.xValues);
    		if ("yValues" in $$props) $$invalidate(18, yValues = $$props.yValues);
    		if ("barWidth" in $$props) $$invalidate(19, barWidth = $$props.barWidth);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("labels" in $$props) $$invalidate(1, labels = $$props.labels);
    		if ("showLabels" in $$props) $$invalidate(2, showLabels = $$props.showLabels);
    		if ("faceColor" in $$props) $$invalidate(20, faceColor = $$props.faceColor);
    		if ("edgeColor" in $$props) $$invalidate(21, edgeColor = $$props.edgeColor);
    		if ("labelsColor" in $$props) $$invalidate(22, labelsColor = $$props.labelsColor);
    		if ("x" in $$props) $$invalidate(3, x = $$props.x);
    		if ("y" in $$props) $$invalidate(4, y = $$props.y);
    		if ("yzero" in $$props) $$invalidate(27, yzero = $$props.yzero);
    		if ("dy" in $$props) $$invalidate(6, dy = $$props.dy);
    		if ("bw" in $$props) $$invalidate(5, bw = $$props.bw);
    		if ("bl" in $$props) $$invalidate(9, bl = $$props.bl);
    		if ("bt" in $$props) $$invalidate(7, bt = $$props.bt);
    		if ("bh" in $$props) $$invalidate(8, bh = $$props.bh);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*xValues, $xLim, $axesWidth*/ 25296896) {
    			// reactive variables for coordinates of data points in pixels
    			$$invalidate(3, x = axes.scaleX(xValues, $xLim, $axesWidth));
    		}

    		if ($$self.$$.dirty[0] & /*yValues, $yLim, $axesHeight*/ 100925440) {
    			$$invalidate(4, y = axes.scaleY(yValues, $yLim, $axesHeight));
    		}

    		if ($$self.$$.dirty[0] & /*$yLim, $axesHeight*/ 100663296) {
    			$$invalidate(27, yzero = axes.scaleY([0], $yLim, $axesHeight));
    		}

    		if ($$self.$$.dirty[0] & /*$scale*/ 268435456) {
    			$$invalidate(6, dy = -axes.LABELS_MARGIN[$scale]);
    		}

    		if ($$self.$$.dirty[0] & /*x, barWidth*/ 524296) {
    			// reactive variables for the bar elements (width, left, top, height)
    			$$invalidate(5, bw = (x[1] - x[0]) * barWidth);
    		}

    		if ($$self.$$.dirty[0] & /*x, bw*/ 40) {
    			$$invalidate(9, bl = x.map(v => v - bw / 2));
    		}

    		if ($$self.$$.dirty[0] & /*y, yzero*/ 134217744) {
    			$$invalidate(7, bt = y.map(v => yzero - v > 0 ? v : yzero));
    		}

    		if ($$self.$$.dirty[0] & /*y, yzero*/ 134217744) {
    			$$invalidate(8, bh = y.map(v => Math.abs(v - yzero)));
    		}
    	};

    	return [
    		title,
    		labels,
    		showLabels,
    		x,
    		y,
    		bw,
    		dy,
    		bt,
    		bh,
    		bl,
    		barsStyleStr,
    		labelsStyleStr,
    		xLim,
    		yLim,
    		axesWidth,
    		axesHeight,
    		scale,
    		xValues,
    		yValues,
    		barWidth,
    		faceColor,
    		edgeColor,
    		labelsColor,
    		$xLim,
    		$axesWidth,
    		$yLim,
    		$axesHeight,
    		yzero,
    		$scale
    	];
    }

    class BarSeries extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				xValues: 17,
    				yValues: 18,
    				barWidth: 19,
    				title: 0,
    				labels: 1,
    				showLabels: 2,
    				faceColor: 20,
    				edgeColor: 21,
    				labelsColor: 22
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BarSeries",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*xValues*/ ctx[17] === undefined && !("xValues" in props)) {
    			console.warn("<BarSeries> was created without expected prop 'xValues'");
    		}

    		if (/*yValues*/ ctx[18] === undefined && !("yValues" in props)) {
    			console.warn("<BarSeries> was created without expected prop 'yValues'");
    		}
    	}

    	get xValues() {
    		throw new Error("<BarSeries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xValues(value) {
    		throw new Error("<BarSeries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yValues() {
    		throw new Error("<BarSeries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yValues(value) {
    		throw new Error("<BarSeries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get barWidth() {
    		throw new Error("<BarSeries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set barWidth(value) {
    		throw new Error("<BarSeries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<BarSeries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<BarSeries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labels() {
    		throw new Error("<BarSeries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labels(value) {
    		throw new Error("<BarSeries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showLabels() {
    		throw new Error("<BarSeries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showLabels(value) {
    		throw new Error("<BarSeries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get faceColor() {
    		throw new Error("<BarSeries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set faceColor(value) {
    		throw new Error("<BarSeries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get edgeColor() {
    		throw new Error("<BarSeries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set edgeColor(value) {
    		throw new Error("<BarSeries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelsColor() {
    		throw new Error("<BarSeries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelsColor(value) {
    		throw new Error("<BarSeries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ../shared/StatApp.svelte generated by Svelte v3.38.2 */

    const file$1 = "../shared/StatApp.svelte";
    const get_help_slot_changes = dirty => ({});
    const get_help_slot_context = ctx => ({});

    // (13:3) {:else}
    function create_else_block(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const help_slot_template = /*#slots*/ ctx[3].help;
    	const help_slot = create_slot(help_slot_template, ctx, /*$$scope*/ ctx[2], get_help_slot_context);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Help text is here\n      ");
    			if (help_slot) help_slot.c();
    			t1 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Back to app";
    			attr_dev(div0, "class", "statapp__helptext svelte-lazl2b");
    			add_location(div0, file$1, 13, 3, 214);
    			add_location(button, file$1, 18, 3, 324);
    			add_location(div1, file$1, 17, 3, 315);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);

    			if (help_slot) {
    				help_slot.m(div0, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*toggleHelp*/ ctx[1]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (help_slot) {
    				if (help_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot(help_slot, help_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_help_slot_changes, get_help_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(help_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(help_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (help_slot) help_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(13:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (8:3) {#if !showHelp}
    function create_if_block(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "statapp__content svelte-lazl2b");
    			add_location(div, file$1, 8, 3, 141);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(8:3) {#if !showHelp}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*showHelp*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "statapp svelte-lazl2b");
    			add_location(main, file$1, 5, 0, 95);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("StatApp", slots, ['default','help']);
    	let showHelp = false;
    	const toggleHelp = () => $$invalidate(0, showHelp = !showHelp);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StatApp> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ showHelp, toggleHelp });

    	$$self.$inject_state = $$props => {
    		if ("showHelp" in $$props) $$invalidate(0, showHelp = $$props.showHelp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showHelp, toggleHelp, $$scope, slots];
    }

    class StatApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StatApp",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    // (19:9) <Axes>
    function create_default_slot_1(ctx) {
    	let barseries;
    	let current;

    	barseries = new BarSeries({
    			props: {
    				xValues: [1, 2, 3],
    				yValues: [10, 20, 15]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(barseries.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(barseries, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(barseries.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(barseries.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(barseries, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(19:9) <Axes>",
    		ctx
    	});

    	return block;
    }

    // (15:0) <StatApp>
    function create_default_slot(ctx) {
    	let div3;
    	let div0;
    	let axes;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let input;
    	let current;

    	axes = new Axes({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			create_component(axes.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			input = element("input");
    			attr_dev(div0, "class", "app-histogram-area");
    			add_location(div0, file, 17, 6, 358);
    			attr_dev(div1, "class", "app-percentile-area");
    			add_location(div1, file, 27, 6, 606);
    			attr_dev(input, "type", "progre");
    			add_location(input, file, 33, 9, 729);
    			attr_dev(div2, "class", "app-controls");
    			add_location(div2, file, 32, 6, 693);
    			attr_dev(div3, "class", "app-layout svelte-r6mszt");
    			add_location(div3, file, 15, 3, 292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			mount_component(axes, div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, input);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const axes_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				axes_changes.$$scope = { dirty, ctx };
    			}

    			axes.$set(axes_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axes.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axes.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(axes);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(15:0) <StatApp>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let statapp;
    	let current;

    	statapp = new StatApp({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(statapp.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(statapp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const statapp_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				statapp_changes.$$scope = { dirty, ctx };
    			}

    			statapp.$set(statapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(statapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(statapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(statapp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const populationSize = 10000;
    const nBins = 100;

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let randomSample = false;
    	let sampleSize = 5;
    	let variableName = "Height";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Axes,
    		BarSeries,
    		StatApp,
    		randomSample,
    		sampleSize,
    		variableName,
    		populationSize,
    		nBins
    	});

    	$$self.$inject_state = $$props => {
    		if ("randomSample" in $$props) randomSample = $$props.randomSample;
    		if ("sampleSize" in $$props) sampleSize = $$props.sampleSize;
    		if ("variableName" in $$props) variableName = $$props.variableName;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=statapps-b1001.js.map
