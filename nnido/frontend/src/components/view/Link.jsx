import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';

import * as d3 from 'd3';

import { selectElements } from '../../actions/graphs';
import { denormalizeCoords, getSystemProperty } from '../../func';
import config from '../../config';

const Link = ({ link_id }) => {
  const link = useSelector((state) => state.graph.graph.data.links[link_id], shallowEqual);
  const linkType = useSelector((state) => (link.type ? state.graph.graph.model.link_types[link.type] : ''), shallowEqual);
  const positionSource = (
    useSelector((s) => s.graph.graph.visualization.node_positions[link.source], shallowEqual)
  );
  const positionTarget = (
    useSelector((s) => s.graph.graph.visualization.node_positions[link.target], shallowEqual)
  );
  const dispatch = useDispatch();
  // const type = useSelector((state) => state.graph.graph.model.link_types[link.type]);

  const myRef = useRef(null);

  const selection = useSelector((state) => state.graph.selection);
  const isSelected = selection.ids.includes(link_id);

  const selectionAdjacent = useSelector((state) => state.graph.selectionAdjacent);
  const isAdjacentToSelected = selectionAdjacent.link_ids.includes(link_id);

  const color = useSelector((state) => getSystemProperty(state.graph.graph, link_id, 'color_link', 'link'), shallowEqual);
  const directed = useSelector((state) => getSystemProperty(state.graph.graph, link_id, 'directed', 'link'), shallowEqual);

  useEffect(() => {
    const source = denormalizeCoords(positionSource.x, positionSource.y);
    const target = denormalizeCoords(positionTarget.x, positionTarget.y);

    let endPoint = target;
    const visibleLineStyle = {
      'marker-end': 'none',
      stroke: config.DEFAULT_NODE_COLOR,
    };

    if (directed) {
      const difference = { x: target.x - source.x, y: target.y - source.y };
      const distance = Math.sqrt(difference.x ** 2 + difference.y ** 2);
      const scaling = (distance - config.DISTANCE_FROM_ARROW_END_TO_NODE_CENTER) / distance;
      visibleLineStyle['marker-end'] = 'url(#arrowhead)';
      endPoint = { x: source.x + difference.x * scaling, y: source.y + difference.y * scaling };
    }

    if (color) {
      visibleLineStyle.stroke = color;
    }

    d3.select(myRef.current)
      .selectAll('line')
      .attr('x1', source.x)
      .attr('y1', source.y)
      .attr('x2', endPoint.x)
      .attr('y2', endPoint.y)
      .on('click', () => {
        d3.event.stopImmediatePropagation();
        dispatch(selectElements({ ids: [link_id], type: 'link' }));
      });
    const visibleLine = d3.select(myRef.current).select('.line_visible');
    Object.entries(visibleLineStyle).forEach(([prop, val]) => visibleLine.style(prop, val));
  }, [positionSource, positionTarget, linkType, link]);

  return (
    <g ref={myRef} id={`link_${link_id}`}>
      <line className="line_shadow" visibility={isSelected ? 'visible' : 'hidden'} />
      <line className="line_hoverarea" />
      <line className="line_visible" />
      <line className="line_adjacent_shadow" visibility={isAdjacentToSelected ? 'visible' : 'hidden'} />
    </g>
  );
};

Link.propTypes = {
  link_id: PropTypes.string.isRequired,
};

export default Link;
