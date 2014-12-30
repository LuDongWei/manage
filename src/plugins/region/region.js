var eventSplitter = /\s+/
  function Events() {}

  Events.prototype.on = function(events, callback, context) {
    var cache, event, list
    if (!callback) return this

    cache = this.__events || (this.__events = {})
    events = events.split(eventSplitter)

    while (event = events.shift()) {
      list = cache[event] || (cache[event] = [])
      list.push(callback, context)
    }

    return this
  }

  Events.prototype.off = function(events, callback, context) {
    var cache, event, list, i

    // No events, or removing *all* events.
    if (!(cache = this.__events)) return this
    if (!(events || callback || context)) {
      delete this.__events
      return this
    }

    events = events ? events.split(eventSplitter) : keys(cache)

    // Loop through the callback list, splicing where appropriate.
    while (event = events.shift()) {
      list = cache[event]
      if (!list) continue

      if (!(callback || context)) {
        delete cache[event]
        continue
      }

      for (i = list.length - 2; i >= 0; i -= 2) {
        if (!(callback && list[i] !== callback ||
            context && list[i + 1] !== context)) {
          list.splice(i, 2)
        }
      }
    }

    return this
  }

  Events.prototype.trigger = function(events) {
    var cache, event, all, list, i, len, rest = [], args
    if (!(cache = this.__events)) return this

    events = events.split(eventSplitter)

    for (i = 1, len = arguments.length; i < len; i++) {
      rest[i - 1] = arguments[i]
    }

    while (event = events.shift()) {
      // Copy callback lists to prevent modification.
      if (all = cache.all) all = all.slice()
      if (list = cache[event]) list = list.slice()

      // Execute event callbacks.
      if (list) {
        for (i = 0, len = list.length; i < len; i += 2) {
          list[i].apply(list[i + 1] || this, rest)
        }
      }

      // Execute "all" callbacks.
      if (all) {
        args = [event].concat(rest)
        for (i = 0, len = all.length; i < len; i += 2) {
          all[i].apply(all[i + 1] || this, args)
        }
      }
    }

    return this
  }


  // Mix `Events` to object instance or Class function.
  Events.mixTo = function(receiver) {
    receiver = receiver.prototype || receiver
    var proto = Events.prototype

    for (var p in proto) {
      if (proto.hasOwnProperty(p)) {
        receiver[p] = proto[p]
      }
    }
  }

  var keys = Object.keys

  if (!keys) {
    keys = function(o) {
      var result = []

      for (var name in o) {
        if (o.hasOwnProperty(name)) {
          result.push(name)
        }
      }
      return result
    }
  }

  
	/*---------------------------------------------------------------------------------------------*/
	var shopApplyData = window.shopApplyRegionData ? window.shopApplyRegionData : [];//适用数据
	
	var View = function (options) {

        var self = this;
        Events.mixTo(self);

        self.types = ["province", "city", "district"];
        self.first = ['请选择省份...', '请选择城市...', '请选择县区...'];

        self.opt = options;
    };

    View.prototype.init = function () {
        var self = this;

        self.dom = $(document.createElement("div")).addClass("rg-selects");

        var html = "";

        for (var i = 0; i < self.types.length; i++) {

            html = html + '<select class="rg-item rg-' + self.types[i] + '" data-type="' + self.types[i] + '" data-first="' + self.first[i] + '"><option>' + self.first[i] + '</option></select><input type="hidden" value="" class="rg-value" name="' + self.opt.inputName[i] + '" id="' + self.opt.inputId[i] + '"/>';

            // html = html + '<div style="z-index:' + (3 - i) + '" ><div class="rg-current"><div class="rg-cur-title" data-first="' + self.first[i] + '">' + self.first[i] + '</div><div class="rg-ico"><i class="rg-arrow"></i></div></div><div class="rg-list" style="z-index:' + (4 - i) + '"></div></div>';
        }

        self.dom.append(html);

        self.dom.on("change", "select", function () {
            var owner = $(this);
            var option = owner.val().split('|');

            var type = option[0];
            var id = option[1];
            var postCode = option[2];
            var name = option[3];

            self.trigger("selected", {
                type: type,
                id: id,
                name: name,
                postCode: postCode
            });

            self.trigger("showSelect", nextType(type));
			
			
			
			
            return false;
        });

        $(self.opt.container).append(self.dom);
		
		
		
		if(shopApplyData.length > 0){
		
			checkShopData('init', shopApplyData);
			updateShop();
		}
		
		//全部门店
		$("body").on("click", "#js-dm-check-allshop", function () {
			var _this = $(this);
			if(_this.is(":checked")){//√
				$('#js-dm-filter-list').find('input[type="checkbox"]').each(function() {
					$(this).prop('checked', true);
				});
			}else{//×
				$('#js-dm-filter-list').find('input[type="checkbox"]').each(function() {
					$(this).prop('checked', false);
				});
			}
		});
		
		//适用门店
		$("body").on("click", "#js-dm-check-applyshop", function () {
			var _this = $(this);
			if(_this.is(":checked")){//√
				$('#js-dm-apply-list').find('input[type="checkbox"]').each(function() {
					$(this).prop('checked', true);
				});
			}else{//×
				$('#js-dm-apply-list').find('input[type="checkbox"]').each(function() {
					$(this).prop('checked', false);
				});
			}
		});
		
		//添加按钮
		$("body").on("click", "#js-dm-exchange-add", function () {
			var cache = [];
			$('input[name="dmAllShopItem"]:checked').each(function(i) {
				
				var _this = $(this);
				var obj = {
					'name' : _this.data('shopname'),
					'code' : _this.val()
				}
				cache.push(obj);
			});
			
			checkShopData('add', cache);
			
			return false;
		});
		
		//删除按钮
		$("body").on("click", "#js-dm-exchange-remove", function () {
			var cache = [];
			$('input[name="dmApplyShopItem"]:checked').each(function(i) {
				
				var _this = $(this);
				var obj = {
					'name' : _this.data('shopname'),
					'code' : _this.val()
				}
				cache.push(obj);
			});
			checkShopData('remove', cache);
			
			return false;
		})
		
		
		
		function updateShop(){
			var shopIds = [];
			for(var k = 0; k<shopApplyData.length; k++){
				shopIds.push(shopApplyData[k].code);
			}
			
			$('#js-data-applyshop').val(shopIds.join(','));
		}
		
		function addshopItem(item){
			var itemHtml = '<li class="shopItem"><input id="dm_input_allpy_'+item.code+'" name="dmApplyShopItem" type="checkbox" data-shopname="'+item.name+'" checked="true" value="'+item.code+'" /><label for="dm_input_allpy_'+item.code+'">'+item.name+'</label></li>';
			
			$('#js-dm-apply-list ul').append(itemHtml);
		}
		
		function removeshopItem(item){
			$("#dm_input_allpy_"+item.code).parent().remove();
		}
		
		function checkShopData(type, arr){
			
			if(type == 'init'){
				for(var i = 0; i<shopApplyData.length; i++){
					addshopItem(shopApplyData[i]);
				}
			}
			
			if(type == 'add'){
				if(arr.length > 0 && shopApplyData.length > 0){
					
					var aLen = arr.length;
					var shopLen = shopApplyData.length;

					for (var i=0; i<aLen; i++){
						var flag = true; 
						for(var j = 0; j<shopLen; j++){
							if(arr[i].code == shopApplyData[j].code){
								flag = false;
							}
						}
						if(flag){
							shopApplyData.push(arr[i]);
							addshopItem(arr[i]);
						}
					}
				}else if(arr.length > 0){
					for(var k = 0; k<arr.length; k++){
						shopApplyData.push(arr[k]);
						addshopItem(arr[k]);
					}
				}
			}
			
			
			if(type == 'remove'){
				
				if(arr.length > 0 && shopApplyData.length > 0){
					var newArr = [];
					var aLen = arr.length;
					var shopLen = shopApplyData.length;
					
					for(var j = 0; j<aLen; j++){
						removeshopItem(arr[j]);
					}
					
					for(var k = 0; k<shopLen; k++){
						var flag = true; 
						for(var j = 0; j<aLen; j++){
							if(arr[j].code == shopApplyData[k].code){
								flag = false;
							}
						}
						if(flag){
							newArr.push(shopApplyData[k]);
						}
					}
					
					shopApplyData = newArr;
				}
				
			}
			
			
			updateShop();

		}
		
		
    };

    View.prototype.reset = function () {
        var self = this;
        if (arguments.length) {
            for (var i = 0; i < arguments.length; i++) {
                var select = $(".rg-" + arguments[i], self.dom);
                select.find("option").remove();
                select.append('<option class="first-opt">' + select.data("first") + '</option>');
            }
        }
    };

    View.prototype.render = function (type, list, selectedObj) {
        var self = this;
        var html = "";

        for (var i = 0, l = list.length; i < l; i++) {
            html = html + '<option ' + (list[i].selected ? 'selected' : '') + ' value="' + type + '|' + list[i].id + '|' + list[i].postCode + '|' + list[i].name + '">' + self.format(list[i].name) + '</option>';
        }

        var select = $(".rg-" + type, self.dom);
        select.append(html).removeAttr('disabled').find('.first-opt').html(select.data('first'));

    };

    View.prototype.loading = function (type) {
        $(".rg-" + type, this.dom).attr('disabled','disabled').find(".first-opt").html('正在加载...');
    };

    View.prototype.needParentId = function (type) {
        $(".rg-" + type, this.dom).html("<option>请选择上一级</option>");
    };

    View.prototype.format = function (name) {
        if (name.length > 8) {
            name = name.substr(0, 6) + "...";
        }
        return name;
    };
	
	
	View.prototype.create = function (type, list, selectedObj) {
		
        var self = this;
        var html = "";
		var coordArr = [];
		
		for (var i = 0, l = list.length; i < l; i++) {
			
			var item = list[i];
			html = html + '<li class="shopItem"><input id="dm_input_shop_'+i+'" name="dmAllShopItem" type="checkbox" value="'+item.code+'" data-shopname="'+item.name+'" /><label for="dm_input_shop_'+i+'">'+item.name+'</label></li>';
			
		}
		$('#js-dm-filter-list ul').html(html);
    };

	
    function nextType(type) {
        if (type == 'province') {
            return 'city';
        } else if (type == 'city') {
            return 'district';
        } else if (type == 'district') {
			
        }
    }
		//------------------------------
		var cache = {};
	
	var flagType = {
		'province' : 0,
		'city'     : 1,
		'district' : 2,
		'last'     : 3 
	}
	
    var Model = function (options) {
            var self = this;
            Events.mixTo(self);

            self.source = "";
            self.inited = false;

            if (options && options.source && $.trim(options.source) !== "") {
                self.source = options.source;
            } else {
                throw new Error("need region source path.");
            }
            self.inited = true;

        };

    Model.prototype.fetch = function (parentID, type) {
        var self = this;
        if (!self.inited) {
            throw new Error("Model need init.");
        }
		

		
        if (isNaN(parseInt(parentID, 10)) || parseInt(parentID, 10) < 0) { //如果选中首项
            throw new Error("parentID is invalid.");
        }

        if (cache[parentID + ""]) {
            return self.trigger("loaded", type, parentID, cache[parentID]);
        }
	
        $.ajax({
            type: "GET",
            url: self.source,
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: {
				"sku_id" : 1404002501, 
				"flag" : type ? flagType[type] : 0, 
                "areaCode": parentID
            },
            success: function (data) {
                if (data && data.region) {
                    self.trigger("loaded", type, parentID, {'region' : data.region, 'shop' : data.store});
                    cache[parentID + ""] = {'region' : data.region, 'shop' : data.store};
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                throw new Error("region data load fail! [parentID:" + parentID + "," + textStatus + "]");
            }
        });
    };
		//------------------------------
		
		var Region = function (options) {
        var self = this;
        Events.mixTo(self);

        self.regionState = {
            "province": {
                parentId: 0,
                selectedId: null
            },
            "city": {
                parentId: null,
                selectedId: null
            },
            "district": {
                parentId: null,
                selectedId: null
            }
        };

        self.opt = $.extend(Region.defaults, options || {});

        self.view = new View({
            showType: self.opt.mobile ? "click" : "mouseenter",
            container: self.opt.target,
            inputName: self.opt.inputName,
            inputId: self.opt.inputId
        });

        self.model = new Model({
            source: self.opt.source
        });

        self.view.on("showSelect", self.onShowSelect, self);
        self.view.on("selected", self.onSelected, self);

        self.model.on("loaded", self.onDataLoaded, self);

    };

    Region.prototype.init = function (seletedIds) {
        var self = this;

        self.isInit = true;

        if (!seletedIds) {
            seletedIds = [null, null, null];
        }

        self.view.init();

        self.regionState.province.parentId = 0;
        self.regionState.city.parentId = seletedIds[0] || null;
        self.regionState.district.parentId = seletedIds[1] || null;

        var provinceIdSelId = self.regionState.province.selectedId = seletedIds[0] || null;
        var citySelId = self.regionState.city.selectedId = seletedIds[1] || null;
        var districtSelId = self.regionState.district.selectedId = seletedIds[2] || null;

        self.model.fetch(0, "province");

        if (provinceIdSelId) {
            self.model.fetch(provinceIdSelId, "city");
        }
        if (citySelId) {
            self.model.fetch(citySelId, "district");
        }

    };

    Region.prototype.onShowSelect = function (type) {
		

        // 最后的省是不用再去加载数据的
        if (!type) {
            return false;
        }
		
	
		
        var self = this;
        var parentId = self.regionState[type].parentId;
        var selectedId = self.regionState[type].selectedId;
		
	
		
        if (parentId === null) {
            self.view.needParentId(type);
        } else if (selectedId === null) {

            self.view.loading(type);

            self.model.fetch(parentId, type);
        }
    };

    Region.prototype.onSelected = function (evtData) {
	
        var self = this;
        var type = evtData.type;
        var id = evtData.id;

        if (type === "province") {

            self.regionState.province.selectedId = id;
            self.regionState.city.parentId = id;
            self.regionState.city.selectedId = null;
            self.regionState.district.parentId = null;
            self.regionState.district.selectedId = null;

            self.view.reset("city", "district");
        }

        if (type === "city") {

            self.regionState.city.selectedId = id;
            self.regionState.district.parentId = id;
            self.regionState.district.selectedId = null;

            self.view.reset("district");
        }

        if (type === "district") {
			
			self.model.fetch(id, "last");
            self.regionState.district.selectedId = id;
        }

        self.trigger("selected", evtData);

        self.isInit = false;
    };

    Region.prototype.onDataLoaded = function (type, parentId, data) {
        var self = this;
        var simpleList = [];
        //var selectedId = parseInt(self.regionState[type].selectedId, 10);
        var selectedObj;
		var list = data.region;
		var shopList = data.shop ? data.shop : [];

        for (var i = 0, l = list.length; i < l; i++) {

            //var isSelected = list[i].regionId === selectedId;

            var item = {
                name: list[i].regionName,
                id: list[i].regionId,
                type: type,
                postCode: list[i].postCode
                //selected: isSelected
            };

            // if (isSelected) {
                // selectedObj = item;
            // }

            simpleList.push(item);
        }
		
        self.view.render(type, simpleList, selectedObj);
		self.view.create(type, shopList, selectedObj);

        if (selectedObj && self.isInit) {
            self.trigger("selected", selectedObj);
        }
    };

    Region.defaults = {
        mobile: false,
        source: "http://www.mbaobao.com/ajax/region",
        target: ".region",
        inputName: ["provinceId", "cityId", "districtId"],
        inputId: ["provinceId", "cityId", "districtId"]
    };
	
	

  
  
