import DynamicProjection from './DynamicProjection';
import PredictionEngine from './PredictionEngine';
import ViewState from './ViewState';
import DataUtil from '../data/DataUtil';
import {Range} from 'explorejs-common';
import {DiffCalculator} from 'explorejs-common';
/**
 * @typedef {{added:WrapperType[], removed:WrapperType[], resized:WrapperType[]}} WrapperDiffType
 */
export default class DataSource {
    /**
     * @param {SerieCache} serieCache
     * @param callback
     */
    constructor(serieCache, callback) {
        this.serieCache = serieCache;
        this._callback = callback;
        this._viewState = new ViewState(this.serieCache.getSerieManifest().levels);
        this.dynamicProjection = new DynamicProjection(this._viewState);
        this.dynamicProjection.SerieCache = serieCache;
        this.dynamicProjection.setup(this._onProjectionChange.bind(this));
        this.predictionEngine = new PredictionEngine(serieCache, this._viewState);
        this._oldProjectionRanges = [];
        this._newProjectionRanges = [];
    }

    /**
     * Returns array of wrapped data points, where outer wrappers have adjusted boundaries according to given range
     * @param range
     * @private
     * @return {RangeType[]}
     */
    _wrapRange(range, oneMore = false) {
        const dataPoints = this.serieCache
            .getLevelCache(range.levelId)
            .getRange(Range[range.levelId === 'raw' ? 'leftClosed' : 'opened'](range.start, range.end), oneMore);
        const boundGetter = DataUtil.boundGetter(range.levelId);
        const wrappers = dataPoints.map(d => ({
            data: d,
            start: boundGetter.start(d),
            end: boundGetter.end(d),
            levelId: range.levelId
        }));

        if (wrappers.length) {
            wrappers[0].start = Math.max(wrappers[0].start, range.start);
            wrappers[wrappers.length - 1].end = Math.min(wrappers[wrappers.length - 1].end, range.end);
        }
        return wrappers;
    }

    /**
     * It will wrap all ranges, the last with oneMore=true to have pa
     * @param ranges
     * @param lastOneMore
     * @private
     */
    _wrapRanges(ranges, lastOneMore = true) {
        const lastRangeIndex = ranges.length - 1;

        return ranges.map((r, i) => this._wrapRange(r, lastOneMore && i === lastRangeIndex)).reduce((a, b) => a.concat(b), []);
    }

    /**
     * A method
     * Get data sufficient to update a chart
     * @param diff
     * @return {WrapperDiffType}
     * for new data - special data wrapper: which level, actual range (note that it may be
     * different than aggregation range after projeciton compilation), and actual data point
     */
    calculateWrappersDiffToPrevious() {
        const msg = `calculateWrappersDiffToPrevious #${this._oldWrappers && this._oldWrappers.length} -> #${this._newWrappers.length}`;

        console.time(msg);
        try {
            return DiffCalculator.compute(this._oldWrappers || [], this._newWrappers, {
                copyFn: a => ({
                    levelId: a.levelId,
                    data: a.data
                })
            });
        } finally {
            console.timeEnd(msg);
        }
    }

    /**
     * Called by dynamic projection
     * @private
     * @param newProjectionRanges
     */
    _onProjectionChange(newProjectionRanges) {
        this._oldProjectionRanges = this._newProjectionRanges;
        this._newProjectionRanges = newProjectionRanges;
        this._oldWrappers = this._newWrappers;
        this._newWrappers = this._wrapRanges(newProjectionRanges);
        console.info('DataSource -> projection changed, will update charts');
        this._callback();
    }

    getWrappers() {
        return this._newWrappers;
    }

    getViewState() {
        return this._viewState;
    }

    destroy() {
        this.dynamicProjection.destroy();
        this.predictionEngine.destroy();
    }
}
