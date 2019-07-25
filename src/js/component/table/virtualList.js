let _debounce = function (func, wait, immediate) {
    let timeout
    return function (...args) {
        let context = this
        let later = function () {
            timeout = null
            if (!immediate) {
                func.apply(context, args)
            }
        }
        let callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) {
            func.apply(context, args)
        }
    }
}
let onlyValues = (values) => (str) => values.indexOf(str) !== -1

export default {
    name: 'we-virtual-list',
    props: {
        height: { type: Number, required: true },
        width: { type: Number, required: true },
        offsetY: { type: Number, default: 0 },
        size: { type: Number, required: true },
        remain: { type: Number, required: true },
        rtag: { type: String, default: 'div' },
        wtag: { type: String, default: 'div' },
        wclass: { type: String, default: '' },
        start: { type: Number, default: 0 },
        offset: { type: Number, default: 0 },
        variable: [Function, Boolean],
        bench: Number,
        debounce: Number,
        totop: Function,
        tobottom: Function,
        toleft: Function,
        toright: Function,
        onscroll: Function,
        scrolldirection: {
            type: String,
            default: 'vertically',
            validator: onlyValues(['vertically', 'horizontal'])
        }
    },

    created: function () {
        let start = this.start >= this.remain ? this.start : 0
        let keeps = this.remain + (this.bench || this.remain)

        this.delta = {
            start: start, // start index.
            end: start + keeps - 1, // end index.
            keeps: keeps, // nums keeping in real dom.
            total: 0, // all items count, update in filter.
            offsetAll: 0, // cache all the scrollable offset.
            paddingTop: 0, // container wrapper real padding-top.
            paddingBottom: 0, // container wrapper real padding-bottom.
            varCache: {}, // object to cache variable index height and scroll offset.
            varAverSize: 0, // average/estimate item height before variable be calculated.
            varLastCalcIndex: 0, // last calculated variable height/offset index, always increase.
            paddingLeft: 0, // container wrapper real padding-left,Use only when the scroll direction is horizontal.
            paddingRight: 0 // container wrapper real padding-right,Use only when the scroll direction is horizontal.
        }
    },

    watch: {
        size: function () {
            this.alter = 'size'
        },
        remain: function () {
            this.alter = 'remain'
        },
        bench: function () {
            this.alter = 'bench'
        },
        start: function () {
            this.alter = 'start'
        },
        offset: function () {
            this.alter = 'offset'
        },
        offsetY: function (val) {
            this.setScrollTop(val)
        }
    },

    methods: {
        onScroll: function (e) {
            let delta = this.delta
            let offset
            if (this.scrolldirection === 'vertically') {
                offset = (this.$refs.vsl && this.$refs.vsl.scrollTop) || 0
            } else if (this.scrolldirection === 'horizontal') {
                offset = (this.$refs.vsl && this.$refs.vsl.scrollLeft) || 0
            }
            if (delta.total > delta.keeps) {
                this.updateZone(offset)
            } else {
                delta.end = delta.total - 1
            }

            let offsetAll = delta.offsetAll
            if (this.onscroll) {
                this.onscroll(e, {
                    offset: offset,
                    offsetAll: offsetAll,
                    start: delta.start,
                    end: delta.end
                })
            }

            if (!offset && delta.total) {
                let startEvent = this.scrolldirection === 'vertically' ? 'totop' : 'toleft'
                this.triggerEvent(startEvent)
            }

            if (offset >= offsetAll) {
                let endEvent = this.scrolldirection === 'vertically' ? 'tobottom' : 'toright'
                this.triggerEvent(endEvent)
            }
        },

        // update render zone by scroll offset.
        updateZone: function (offset) {
            let overs = this.variable ? this.getVarOvers(offset) : Math.floor(offset / this.size)
            let delta = this.delta
            let zone = this.getZone(overs)
            let bench = this.bench || this.remain

            if (!zone.isLast && (overs > delta.start) && (overs - delta.start < bench)) {
                return
            }

            delta.end = zone.end
            delta.start = zone.start
            this.forceRender()
        },

        forceRender () {
            let that = this
            window.requestAnimationFrame(function () {
                that.$forceUpdate()
            })
        },

        // return the scroll passed items count in variable.
        getVarOvers: function (offset) {
            let low = 0
            let middle = 0
            let middleOffset = 0
            let delta = this.delta
            let high = delta.total

            while (low <= high) {
                middle = low + Math.floor((high - low) / 2)
                middleOffset = this.getVarOffset(middle)

                // calculate the average variable height at first binary search.
                if (!delta.varAverSize) {
                    delta.varAverSize = Math.floor(middleOffset / middle)
                }

                if (middleOffset === offset) {
                    return middle
                } else if (middleOffset < offset) {
                    low = middle + 1
                } else if (middleOffset > offset) {
                    high = middle - 1
                }
            }

            return low > 0 ? --low : 0
        },

        // return a variable scroll offset from given index.
        getVarOffset: function (index, nocache) {
            let delta = this.delta
            let cache = delta.varCache[index]

            if (!nocache && cache) {
                return cache.offset
            }

            let offset = 0
            for (let i = 0; i < index; i++) {
                let size = this.getVarSize(i, nocache)
                delta.varCache[i] = {
                    size: size,
                    offset: offset
                }
                offset += size
            }

            delta.varLastCalcIndex = Math.max(delta.varLastCalcIndex, index - 1)
            delta.varLastCalcIndex = Math.min(delta.varLastCalcIndex, delta.total - 1)

            return offset
        },

        // return a variable size (height) from given index.
        getVarSize: function (index, nocache) {
            let cache = this.delta.varCache[index]
            if (!nocache && cache) {
                return cache.size
            }

            if (typeof this.variable === 'function') {
                let varSize = this.variable(index) || 0
                let size = this.size > varSize ? this.size : varSize
                return size
            } else {
                let slot = this.$slots.default[index]
                let style = slot && slot.data && slot.data.style
                let shm
                if (this.scrolldirection === 'vertically') {
                    if (style && style.height) {
                        shm = style.height.match(/^(.*)px$/)
                        return (shm && +shm[1]) || 0
                    }
                } else if (this.scrolldirection === 'horizontal') {
                    if (style && style.width) {
                        shm = style.width.match(/^(.*)px$/)
                        return (shm && +shm[1]) || 0
                    }
                }
            }
            return 0
        },

        // return the variable paddingTop(paddingLeft when scroll direction is horizontal) base current zone.
        // @todo: if set a large `start` before variable was calculated,
        // here will also case too much offset calculate when list is very large,
        // consider use estimate paddingTop in this case just like `getVarPaddingBottom`.
        getVarPaddingStart: function () {
            return this.getVarOffset(this.delta.start)
        },

        // return the variable paddingBottom(paddingRight when scroll direction is horizontal) base current zone.
        getVarPaddingEnd: function () {
            let delta = this.delta
            let last = delta.total - 1
            if (delta.total - delta.end <= delta.keeps || delta.varLastCalcIndex === last) {
                return this.getVarOffset(last) - this.getVarOffset(delta.end)
            } else {
                // if unreached last zone or uncalculate real behind offset
                // return the estimate paddingBottom avoid too much calculate.
                return (delta.total - delta.end) * (delta.varAverSize || this.size)
            }
        },

        // retun the variable all heights(widths when scroll direction is horizontal) use to judge reach bottom.
        getVarAllSize: function () {
            let delta = this.delta
            if (delta.total - delta.end <= delta.keeps || delta.varLastCalcIndex === delta.total - 1) {
                return this.getVarOffset(delta.total)
            } else {
                return this.getVarOffset(delta.start) + (delta.total - delta.end) * (delta.varAverSize || this.size)
            }
        },

        // the ONLY ONE public method, allow the parent update variable by index.
        updateVariable: function (index) {
            // clear/update all the offfsets and heights ahead of index.
            this.getVarOffset(index, true)
        },

        // return the right zone info base on `start/index`.
        getZone: function (index) {
            let start
            let end
            let delta = this.delta

            index = parseInt(index, 10)
            index = Math.max(0, index)

            let lastStart = delta.total - delta.keeps
            let isLast = (index <= delta.total && index >= lastStart) || index > delta.total
            if (isLast) {
                end = delta.total - 1
                start = Math.max(0, lastStart)
            } else {
                start = index
                end = start + delta.keeps - 1
            }

            return {
                end: end,
                start: start,
                isLast: isLast
            }
        },

        // trigger a props event on parent.
        triggerEvent: function (event) {
            if (this[event]) {
                this[event]()
            }
        },

        // set manual scroll.
        setScroll: function (scroll, type) {
            let vsl = this.$refs.vsl
            if (vsl) {
                if (this.scrolldirection === 'vertically') {
                    vsl.scrollTop = scroll
                } else if (this.scrolldirection === 'horizontal') {
                    vsl.scrollLeft = scroll
                }
            }
        },
        setScrollTop (val) {
            let vsl = this.$refs.vsl
            if (vsl) {
                if (this.scrolldirection === 'horizontal') {
                    vsl.scrollTop = val
                }
            }
        },

        // filter the shown items base on `start` and `end`.
        filter: function () {
            let delta = this.delta
            let slots = this.$slots.default
            if (!slots) {
                slots = []
                delta.start = 0
            }

            delta.total = slots.length

            let paddingStart
            let paddingEnd
            let allSize
            let hasPadding = delta.total > delta.keeps

            if (this.variable) {
                allSize = this.getVarAllSize()
                paddingStart = hasPadding ? this.getVarPaddingStart() : 0
                paddingEnd = hasPadding ? this.getVarPaddingEnd() : 0
            } else {
                allSize = this.size * delta.total
                paddingStart = this.size * (hasPadding ? delta.start : 0)
                paddingEnd = this.size * (hasPadding ? delta.total - delta.keeps : 0) - paddingStart
            }
            if (this.scrolldirection === 'vertically') {
                delta.paddingTop = paddingStart
                delta.paddingBottom = paddingEnd
            } else if (this.scrolldirection === 'horizontal') {
                delta.paddingLeft = paddingStart
                delta.paddingRight = paddingEnd
            }
            delta.offsetAll = allSize - this.size * this.remain

            let targets = []
            for (let i = delta.start; i <= Math.ceil(delta.end); i++) {
                if (this.scrolldirection === 'horizontal' && slots[i]) {
                    slots[i].data.style = Object.assign(
                        {},
                        {
                            flexShrink: 0
                        },
                        slots[i].data.style
                    )
                }
                targets.push(slots[i])
            }
            return targets
        },
        init () {
            if (this.start) {
                let start = this.getZone(this.start).start
                this.setScroll(this.variable ? this.getVarOffset(start) : start * this.size, 'init')
            } else if (this.offset) {
                this.setScroll(this.offset, 'init')
                this.setScrollTop(this.offsetY)
            }
        }
    },

    mounted: function () {
        this.init()
    },

    // check if delta should update when prorps change.
    beforeUpdate: function () {
        let delta = this.delta
        delta.keeps = this.remain + (this.bench || this.remain)
        let calcstart = this.alter === 'start' ? this.start : delta.start
        let zone = this.getZone(calcstart)
        // if start, size or offset change, update scroll position.
        if (~['start', 'size', 'offset'].indexOf(this.alter)) {
            this.$nextTick(
                this.setScroll.bind(
                    this,
                    this.alter === 'offset'
                        ? this.offset
                        : this.variable
                            ? this.getVarOffset(zone.isLast ? delta.total : zone.start)
                            : zone.isLast && delta.total - calcstart <= this.remain ? delta.total * this.size : calcstart * this.size
                    , 'alter')
            )
        }

        // if points out difference, force update once again.
        if (calcstart !== zone.start || delta.end !== zone.end || this.alter) {
            this.alter = ''
            delta.end = zone.end
            delta.start = zone.start
            this.$forceUpdate()
        }
    },
    render: function (h) {
        let list = this.filter()
        let delta = this.delta
        let dbc = this.debounce
        let rtagStyle = {
            'display': 'block',
            'overflow-y': 'auto'
        }
        let wtagStyle
        if (this.scrolldirection === 'vertically') {
            rtagStyle.height = this.size * this.remain + 'px'
            wtagStyle = {
                'display': 'block',
                'padding-top': delta.paddingTop + 'px',
                'padding-bottom': delta.paddingBottom + 'px'
            }
        } else {
            if (this.height) {
                rtagStyle.height = this.height + 'px'
            }
            rtagStyle.width = this.width + 'px'
            wtagStyle = {
                'display': 'flex',
                'padding-left': delta.paddingLeft + 'px',
                'padding-right': delta.paddingRight + 'px'
            }
        }
        return h(
            this.rtag,
            {
                ref: 'vsl',
                style: rtagStyle,
                on: {
                    '&scroll': dbc ? _debounce(this.onScroll.bind(this), dbc) : this.onScroll
                }
            },
            [
                h(
                    this.wtag,
                    {
                        style: wtagStyle,
                        class: this.wclass
                    },
                    list
                )
            ]
        )
    }
}
