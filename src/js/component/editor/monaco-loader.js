import _ from 'lodash';
import hql from './languages/hql';
import log from './languages/log';
import sas from './languages/sas';
import defaultView from './theme/defaultView';
import logview from './theme/logView';
import hqlKeyword from './keyword/hql';
import pythonKeyword from './keyword/python';
import sasKeyword from './keyword/sas';

export default {
    /* For now: default to cdn. */
    load(type) {
        let self = this;
        return new Promise((resolve, reject) => {
            if (window.monaco) {
                return resolve(window.monaco);
            }
            const config = {
                paths: {
                    vs: 'static/vs',
                },
            };
            const loaderUrl = `${config.paths.vs}/loader.js`;
            const onGotAmdLoader = () => {
                if (window.LOADER_PENDING) {
                    window.require.config(config);
                    window.require.config({
                        'vs/nls': {
                            availableLanguages: {
                                '*': 'zh-cn',
                            },
                        },
                    });
                }

                // Load monaco
                window.require(['vs/editor/editor.main'], () => {
                    // 获取已注册的语言
                    const languagesList = window.monaco.languages.getLanguages();
                    // 判断系统私有的语言是否已被注册，防止打开多TAB时多次注册
                    const findLang = _.find(languagesList, (lang) => {
                        return lang.id === 'hql';
                    });
                    if (type === 'code' && !findLang) {
                        self.register(window.monaco);
                    }
                    resolve(window.monaco);
                });

                // Call the delayed callbacks when AMD loader has been loaded
                if (window.LOADER_PENDING) {
                    window.LOADER_PENDING = false;
                    const loaderCallbacks = window.LOADER_CALLBACKS;
                    if (loaderCallbacks && loaderCallbacks.length) {
                        let currentCallback = loaderCallbacks.shift();
                        while (currentCallback) {
                            currentCallback.fn.call(currentCallback.window);
                            currentCallback = loaderCallbacks.shift();
                        }
                    }
                }
            };

            // Load AMD loader if necessary
            if (window.LOADER_PENDING) {
                window.LOADER_CALLBACKS = window.LOADER_CALLBACKS || [];
                window.LOADER_CALLBACKS.push({
                    window: this,
                    fn: onGotAmdLoader,
                });
            } else {
                if (typeof window.require === 'undefined') {
                    const loaderScript = window.document.createElement('script');
                    loaderScript.type = 'text/javascript';
                    loaderScript.src = loaderUrl;
                    loaderScript.addEventListener('load', onGotAmdLoader);
                    window.document.body.appendChild(loaderScript);
                    window.LOADER_PENDING = true;
                } else {
                    onGotAmdLoader();
                }
            }
        });
    },
    register(monaco) {
        // 注册languages
        hql.register(monaco);
        log.register(monaco);
        sas.register(monaco);

        // 注册theme
        defaultView.register(monaco);
        logview.register(monaco);

        // 注册关键字联想
        hqlKeyword.register(monaco);
        pythonKeyword.register(monaco);
        sasKeyword.register(monaco);
    },
};
