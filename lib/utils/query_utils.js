function prepareQuery(sql) {
  let affectedTableRegexCache = {
      bbox: /!bbox!/g,
      scale_denominator: /!scale_denominator!/g,
      pixel_width: /!pixel_width!/g,
      pixel_height: /!pixel_height!/g
  };

  return sql
      .replace(affectedTableRegexCache.bbox, 'ST_MakeEnvelope(0,0,0,0)')
      .replace(affectedTableRegexCache.scale_denominator, '0')
      .replace(affectedTableRegexCache.pixel_width, '1')
      .replace(affectedTableRegexCache.pixel_height, '1');
}

module.exports.extractTableNames = function extractTableNames(query) {
    return [
        'SELECT * FROM CDB_QueryTablesText($windshaft$',
        prepareQuery(query),
        '$windshaft$) as tablenames'
    ].join('');
};

module.exports.getQueryRowCount = function getQueryRowEstimation(query) {
    return 'select CDB_EstimateRowCount(\'' + query + '\', \') as rows';
};

module.exports.getTableStats = function getTableStats(table, geomColumn) {
    geomColumn = geomColumn || 'the_geom';

    return [
        'with table_stats as (select _postgis_stats(\'' + table + '\'::regclass, \'' +
        ', \'' + geomColumn + '\') as stats) ' +
        'select stats::jsonb->>\'histogram_features\' as features, ' +
        'stats::jsonb->>\'not_null_features\' as rows, ' +
        '((stats::jsonb->>\'histogram_features\')::numeric /  ' +
        '(stats::jsonb->>\'not_null_features\')::numeric)::numeric as ratio from table_stats'
    ].join('\n');
};
