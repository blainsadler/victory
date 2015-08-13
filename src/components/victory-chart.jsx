import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";
import {VictoryLine} from "victory-line";
import {VictoryAxis} from "victory-axis";

@Radium
class VictoryChart extends React.Component {
  constructor(props) {
    super(props);

    // Initialize state
    this.state = {};

    // Either we get data, or we get X/Y.
    // `y` will either be none, a function, an array of numbers,
    // or an array of functions.
    if (this.props.data) {
      this.state.data = this.props.data;
    } else {
      this.state = {};
      this.state.x = this.returnOrGenerateX();
      this.state.y = this.returnOrGenerateY();

      const inter = _.map(this.state.y, (y) => _.zip(this.state.x, y));

      // Create a map {line-number: dataForLine}
      const objs = _.chain(inter)
        .map((objArray, idx) => {
          return [
            "line-" + idx,
            _.map(
              objArray,
              (obj) => {
                return {x: obj[0], y: obj[1]};
              }
            )
          ];
        })
        .object()
        .value();

      this.state.data = objs;
    }
  }

  returnOrGenerateX() {
    const step = Math.round(this.props.xMax / this.props.sample, 4);
    return this.props.x
     ? this.props.x
     : _.range(this.props.xMin, this.props.xMax, step);
  }

  returnOrGenerateY() {
    // Always return an array of arrays.
    const y = this.props.y;

    if (_.isFunction(y)) {
      return [_.map(this.state.x, (x) => y(x))];
    } else if (_.isObject(y)) {
      // y is an array of functions
      if (_.isFunction(y[0])) {
        return _.map(y, (yFn) => _.map(this.state.x, (x) => yFn(x)));
      } else {
        return [y];
      }
    } else {
      // asplode
      return null;
    }
  }

  getStyles() {
    return _.merge({
      base: {
        color: "#000",
        fontSize: 12,
        textDecoration: "underline"
      },
      svg: {
        "border": "2px solid black",
        "margin": "20",
        "width": "500",
        "height": "200"
      }
    }, this.props.style);
  }

  render() {

    const styles = this.getStyles();

    // Lines need 2x + a lil' margin to line up nicely.
    const lineStyleBase = _.merge(
      styles,
      {
        svg: {
          margin: (styles.svg.margin * 2) + 2
        }
      }
    );

    const lines = _.map(this.state.data, (data, key) => {
      // Make sure we aren't mutating base styles.
      const lineStyle = _.clone(lineStyleBase);

      lineStyle.path = this.props.lineStyles[key];
      return (
        <VictoryLine {...this.props}
          data={data}
          style={lineStyle}
          ref={key ? _.isString(key) : "line-" + key}
          key={Math.random()}/>
      );
    });

    return (
      <svg style={styles.svg}>
        {lines}
        <VictoryAxis {...this.props} style={styles}/>
      </svg>
    );
  }
}

VictoryChart.propTypes = {
  color: React.PropTypes.string
};

VictoryChart.propTypes = {
  data: React.PropTypes.arrayOf(
    React.PropTypes.arrayOf(
      React.PropTypes.shape({
        x: React.PropTypes.number,
        y: React.PropTypes.number
      })
    )
  ),
  interpolation: React.PropTypes.oneOf([
    "linear",
    "linear-closed",
    "step",
    "step-before",
    "step-after",
    "basis",
    "basis-open",
    "basis-closed",
    "bundle",
    "cardinal",
    "cardinal-open",
    "cardinal-closed",
    "monotone"
  ]),
  lineStyles: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(
      React.PropTypes.shape({
        "stroke": React.PropTypes.string,
        "strokeWidth": React.PropTypes.string
      })
    ),
    React.PropTypes.objectOf(
      React.PropTypes.shape({
        "stroke": React.PropTypes.string,
        "strokeWidth": React.PropTypes.string
      })
    )
  ]),
  sample: React.PropTypes.number,
  scale: React.PropTypes.func,
  style: React.PropTypes.node,
  x: React.PropTypes.array,
  xDomain: React.PropTypes.array,
  yDomain: React.PropTypes.array,
  y: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.func,
    React.PropTypes.arrayOf(React.PropTypes.func)
  ])
};

VictoryChart.defaultProps = {
  data: null,
  interpolation: "basis",
  lineStyles: [{}],
  sample: 100,
  scale: () => d3.scale.linear(),
  x: null,
  xDomain: [0, 100],
  y: () => Math.random(),
  yDomain: [0, 100]
};

export default VictoryChart;
