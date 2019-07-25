const cache = {};
let key = 1;
export default {
    inserted(el, binding) {
        el.outsideKey = key++;
        const self = {};
        self.documentHandler = (e) => {
            if (el.contains(e.target)) {
                return false;
            }
            if (binding.value) {
                binding.value();
            }
            return true;
        };
        cache[el.outsideKey] = self;
        document.addEventListener('click', self.documentHandler);
    },
    unbind(el) {
        const self = cache[el.outsideKey];
        document.removeEventListener('click', self.documentHandler);
    },
};
