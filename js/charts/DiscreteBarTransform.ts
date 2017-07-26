import {computed} from 'mobx'
import * as _ from 'lodash'
import ChartConfig from './ChartConfig'
import Color from './Color'
import {DiscreteBarDatum} from './DiscreteBarChart'

// Responsible for translating chart configuration into the form
// of a discrete bar chart
export default class DiscreteBarTransform {
    chart: ChartConfig

    constructor(chart: ChartConfig) {
        this.chart = chart
    }

	@computed get data(): DiscreteBarDatum[] {
        const {chart} = this
        const {dimensions, vardata, timeDomain, selectedEntitiesByKey} = chart
        const {variablesById} = vardata

		const timeFrom = _.defaultTo(timeDomain[0], -Infinity)
		const timeTo = _.defaultTo(timeDomain[1], Infinity)
        const dimension = _.find(dimensions, d => d.property == "y")

        if (!dimension)
            return []

        const variable = variablesById[dimension.variableId]

        let targetYear
        if (_.isFinite(timeTo))
            targetYear = _.sortBy(variable.yearsUniq, function(year) { return Math.abs(year-timeTo); })[0];
        else
            targetYear = _.max(variable.yearsUniq);


        const data: DiscreteBarDatum[] = []

        for (var i = 0; i < variable.years.length; i++) {
            const year = variable.years[i]
            const entity = variable.entities[i]

            if (year != targetYear || !selectedEntitiesByKey[entity]) continue;
//            if (year != targetYear) continue;

            data.push({
                value: +variable.values[i],
                label: entity,
                color: chart.colors.assignColorForKey(entity)
            })
        }

        return _.sortBy(data, d => -d.value)
	}
}