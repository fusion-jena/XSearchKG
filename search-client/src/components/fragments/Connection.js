import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import ConnectingNode from './ConnectingNode';
import './Connection.css';

const Connection = ({ connection, target, detailed, index, connectionCount }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [visiblebindings, setVisibleBindings] = useState([0]);
	const [hasMoreBindings, setHasMoreBindings] = useState(connection?.bindingCount > 1);
	const [disabledConnections, setDisabledConnections] = useState([]);
	const [isDisabledConnection, setDisabledConnection] = useState(false);
	const [activeConnectionCount, setActiveConnectionCount] = useState(connectionCount);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const disabledConns = (params.get('disabledConnections') || '').split(',').filter(sg => sg).map(sg => Number(sg));
		setDisabledConnections(disabledConns);
		setDisabledConnection(disabledConns.includes(index));
		setActiveConnectionCount(connectionCount - disabledConns.length);
	}, [location.search, connectionCount, index]);


	const addConnection = () => {
		const i = disabledConnections.findIndex(disabledConnection => disabledConnection === index);
		disabledConnections.splice(i, 1);
		showResults();
	}

	const removeConnection = () => {
		disabledConnections.push(index);
		showResults();
	}

	const exclusiveConnection = () => {
		disabledConnections.splice(0, disabledConnections.length);
		for (let i = 0; i < connectionCount; i++) {
			if (i !== index) {
				disabledConnections.push(i);
			}
		}
		showResults();
	}

	const showResults = () => {
		const params = new URLSearchParams(location.search);
		if (disabledConnections.length > 0) {
			params.set('disabledConnections', disabledConnections.join(','));
		} else {
			params.delete('disabledConnections');
		}
		params.delete('iri');
		params.delete('page');
		const path = location.pathname === "/result" ? "/results" : location.pathname;
		navigate(path + '?' + params);
	}

	const showMoreExamples = (event) => {
		event.stopPropagation();
		setVisibleBindings(Array.from({ length: connection.bindingCount }, (_, i) => i));
		setHasMoreBindings(false);
	}

	const showLessExamples = (event) => {
		event.stopPropagation();
		setVisibleBindings([0]);
		setHasMoreBindings(connection?.bindingCount > 1);
	}
	
	return (
		<div className={`Connection ${detailed ? "expandable" : ""}`}>
			{detailed &&
				<div className="actions">
					{(isDisabledConnection || activeConnectionCount > 1) &&
						<span data-tooltip-content="Consider only connections of this type" data-tooltip-id="tooltip-star-{index}">
							<Icon icon="mdi:star-outline" width="22" onClick={exclusiveConnection} aria-label="Consider only connections of this type" />
							<Tooltip id="tooltip-star-{index}" />
						</span>
					}
					{isDisabledConnection &&
						<span data-tooltip-content="Consider connections of this type" data-tooltip-id="tooltip-plus-{index}">
							<Icon icon="mdi:plus-circle-outline" width="22" onClick={addConnection} aria-label="Consider connections of this type" />
							<Tooltip id="tooltip-plus-{index}" />
						</span>
					}
					{!isDisabledConnection && activeConnectionCount > 1 &&
						<span data-tooltip-content="Ignore connections of this type" data-tooltip-id="tooltip-minus-{index}">
							<Icon icon="mdi:minus-circle-outline" width="22" onClick={removeConnection} aria-label="Ignore connections of this type" />
							<Tooltip id="tooltip-minus-{index}" />
						</span>
					}
				</div>
			}
			<div className='content'>
				<div className='bindings'>
					{visiblebindings.map((binding) => (
						<div key={binding} className='binding' >
							<div className='target'>{target.name}</div>
							<div>
								{connection?.connectingNodes.map((connectingNode, index) => (
									<ConnectingNode key={index} connectingNode={connectingNode} binding={binding} showEdge={detailed} />
								))}
							</div>
							{!detailed && connection && target.connectionCount > 0 && (
								<div><span className='connectionCount'>{target.connectionCount} {target.connectionCount === 1 ? 'Connection' : 'Connections'}</span></div>
							)}
						</div>
					))}
				</div>
				{hasMoreBindings && (
					<div>This is only an example. <button className="link" onClick={showMoreExamples}>Show more examples</button></div>
				)}
				{visiblebindings.length > 1 && (
					<div><button className="link" onClick={showLessExamples}>Show less examples</button></div>
				)}
			</div>
		</div>
	);
}

export default Connection;
