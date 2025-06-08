import React from 'react';
import PropTypes from 'prop-types';
import { TreeList, Container, Panel } from '@extjs/reactor/classic';

Ext.require('Ext.data.TreeStore');

/**
 * The main navigation menu
 */
export default function NavMenu({
    onItemClick,
    selection,
    store,
    ...props
}) {

    return (
        <TreeList
            {...props}
            ui={'nav'}
            expanded={true}
            floated={false}
            expanderOnly={false}
            expanderFirst={false}
            onItemClick={(tree, item) => onItemClick(item.node.getId(), item.node.data)}
            selection={selection}
            store={store}
            scrollable={true}
            expanderOnly={false}
            singleExpand={false}/>
    )
}

NavMenu.propTypes = {
    onSelectionChange: PropTypes.func,
    selection: PropTypes.string
};
