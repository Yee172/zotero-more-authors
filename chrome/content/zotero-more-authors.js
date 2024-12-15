Zotero.moreAuthors = new function ()
{
    const AUTHORS_COLUMN_ID = 'zotero-items-column-authors';

    function makeElement( tagName )
    {
        return document.createElementNS( 'http://www.w3.org/1999/xhtml', tagName );
    }

    function SPAN()
    {
        return makeElement( 'div' );
    }

    this.init = async function ()
    {
        Zotero.log( "authors column: initialize" );

        if ( typeof Zotero.ItemTreeView === 'undefined' )
        {
            // version 6+
            const itemTree = require( 'zotero/itemTree' );

            let totalKnownFields = 0;
            let injectedFieldId = 0;
            var original_getID = Zotero.ItemFields.getID;
            Zotero.ItemFields.getID = function ( field )
            {
                if ( field == AUTHORS_COLUMN_ID )
                {
                    // get size of the _allFields array from Zotero.itemFields
                    if ( totalKnownFields == 0 )
                    {
                        for ( const field of Zotero.ItemFields.getAll() )
                        {
                            if ( original_getID( field.id ) ) totalKnownFields ++;
                        }
                    }
                    injectedFieldId = totalKnownFields + 1;

                    var original_isBaseField = Zotero.ItemFields.isBaseField;
                    Zotero.ItemFields.isBaseField = function ( field )
                    {
                        if ( field == injectedFieldId ) return false;
                        return original_isBaseField( field );
                    }
                    return injectedFieldId;
                }
                return original_getID( field );
            }

            var original_getColumns = itemTree.prototype.getColumns
            itemTree.prototype.getColumns = function ()
            {
                const columns = original_getColumns.apply( this, arguments )
                columns.splice(
                    columns.findIndex( column => column.dataKey === 'title' ) + 1,
                    0,
                    {
                        dataKey: AUTHORS_COLUMN_ID,
                        label: 'Authors',
                        flex: '1',
                        zoteroPersist: new Set( [ 'width', 'ordinal', 'hidden', 'sortActive', 'sortDirection' ] ),
                    }
                )
                return columns;
            }

            var original_renderCell = itemTree.prototype._renderCell;
            itemTree.prototype._renderCell = function ( index, data, col )
            {
                const item = this.getRow( index ).ref;

                if ( col.dataKey === 'title' ) return original_renderCell.apply( this, arguments );

                if ( col.dataKey !== AUTHORS_COLUMN_ID ) return original_renderCell.apply( this, arguments );

                const cell = SPAN();
                cell.className = `cell ${col.className}`;

                const creators = item.getCreators();
                const author_list = [];

                for ( const each_creator of creators )
                {
                    // author_list.push( each_creator.firstName + ' ' + each_creator.lastName );
                    author_list.push( each_creator.lastName );
                }

                cell.append( author_list.join( ', ' ) );

                return cell;
            }
        }
        else
        {
            // version 5
            var original_getCellText = Zotero.ItemTreeView.prototype.getCellText;
            Zotero.ItemTreeView.prototype.getCellText = function ( row, col )
            {
                if ( col.id !== 'zotero-items-column-authors' )
                    return original_getCellText.apply( this, arguments );

                const creators = item.getCreators();
                const author_list = [];

                for ( const each_creator of creators )
                    author_list.push( each_creator.lastName );

                return author_list.join( ', ' );
            }
        }

        return Zotero.Schema.schemaUpdatePromise;
    };
};
