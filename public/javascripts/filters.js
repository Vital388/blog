/**
 * Created by Lollypop on 01.02.2016.
 */
angular.module('blog')
    .filter('trusted', function($sce){
        return function(html){
            return $sce.trustAsHtml(html)
        }
    });