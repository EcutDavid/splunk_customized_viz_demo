define([
            'jquery',
            'underscore',
            'vizapi/SplunkVisualizationBase',
            'vizapi/SplunkVisualizationUtils',
            'd3'
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            SplunkVisualizationUtils,
            d3
        ) {

    return SplunkVisualizationBase.extend({

        initialize: function() {
            // Save this.$el for convenience
            this.$el = $(this.el);

            // Add a css selector class
            this.$el.addClass('splunk-radial-meter');
        },

        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 10000
            });
        },

        formatData: function(data, config) {

            // Check for an empty data object
            if(data.rows.length < 1){
                return false;
            }
            var datum = parseFloat(data.rows[0][0]);

            // Check for invalid data
            if(_.isNaN(datum)){
                throw new SplunkVisualizationBase.VisualizationError(
                    'This meter only supports numbers'
                );
            }

            return data;
        },

        updateView: function(data, config) {

            // Guard for empty data
            if(!data || data.rows.length < 1){
                return;
            }
            // Take the first data point
            datum = data.rows[0][0];
            // Clear the div
            this.$el.empty();

            // Pick a color for now
            var mainColor = 'skyblue';
            // Set domain max
            var maxValue = 100;

            // Set height and width
            var height = 220;
            var width = 220;

            // Create a radial scale representing part of a circle
            var scale = d3.scale.linear()
                .domain([0, maxValue])
                .range([ - Math.PI * .75, Math.PI * .75])
                .clamp(true);

            // Create parameterized arc definition
            var arc = d3.svg.arc()
                .startAngle(function(d){
                    return scale(0);
                })
                .endAngle(function(d){
                    return scale(d)
                })
                .innerRadius(90)
                .outerRadius(105);

            // SVG setup
            var svg  = d3.select(this.el).append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'white')
                .append('g')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

            // Background arc
            svg.append('path')
                .datum(maxValue)
                .attr('d', arc)
                .style('fill', 'lightgray');

            // Fill arc
            svg.append('path')
                .datum(datum)
                .attr('d', arc)
                .style('fill', mainColor);

            // Text
            svg.append('text')
                .datum(datum)
                .attr('class', 'meter-center-text')
                .style('text-anchor', 'middle')
                .style('fill', mainColor)
                .text(function(d){
                    return parseFloat(d);
                })
                .attr('transform', 'translate(' + 0 + ',' + 20 + ')');
        }
    });
});
