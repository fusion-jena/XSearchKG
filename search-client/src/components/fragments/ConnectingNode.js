import React from 'react';
import './ConnectingNode.css';

const ConnectingNode = ({ connectingNode, binding, showEdge }) => {
	return (
		<div className='ConnectingNode'>
			{!connectingNode.values[binding].hidden && (
				<div>
					{showEdge ? (
						<span>
							<span className='edge'>&nbsp;{connectingNode.edge.name}&nbsp;{connectingNode.values[binding]?.name ? 'the ' + connectingNode.type.name.toLowerCase() : 'a'}&nbsp;</span>
						</span>
					) : <span className='dash'>&mdash;</span>}
					<span className='node'>
						{connectingNode.values[binding]?.name || connectingNode.type.name.toLowerCase()}
					</span>
					<span className='edge'>{showEdge && connectingNode.connectingNodes.length > 0 ? ', that' : undefined}</span>
				</div>
			)}
			<div>
				{connectingNode.connectingNodes.map((connectingNode, index) => (
					<div key={index}>
						<ConnectingNode connectingNode={connectingNode} binding={binding} showEdge={showEdge} />
					</div>
				))}
			</div>
		</div>
	);
};

export default ConnectingNode;
