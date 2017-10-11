import { Pie, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default Pie.extend({
  mixins: [reactiveProp],
  props: ['chartData', 'options'],
  mounted () {
    this.renderChart(this.chartData, {responsive: true, maintainAspectRatio: false})
  }
})