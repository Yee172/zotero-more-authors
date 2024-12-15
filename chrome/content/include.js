if ( ! Zotero.specialTagsColumn )
{
    const service = Components.classes[ "@mozilla.org/moz/jssubscript-loader;1" ].getService( Components.interfaces.mozIJSSubScriptLoader );
    service.loadSubScript( "chrome://zotero-more-authors/content/zotero-more-authors.js" );
    window.addEventListener( 'load', function( e ) { Zotero.moreAuthors.init(); }, false );  
}
