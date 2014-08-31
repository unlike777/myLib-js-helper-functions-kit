/*
* Собственный класс вспомогательных функций для JS
*
* langs - массив с доступными языками
* lang - массив с языковыми переменными
* ajax - флаг проверки выполнения ajax запросов
*
* getLang() - Определяет текущий язык сайта (по первой секции url), если ничего не найдено возвращается первый из доступных языков
* getMessage(name) - Возвращает языковую переменную из массива lang, в зависимости от текущего языка сайта
* addMessage(object) - Добавляет языковую переменную в массива lang, object - литерал содержащий переводы на разные языки
* alert(text, title, foo) - Абстракция для всплывающих сообщений
* get(url, foo, type, fail) - Декоратор для функции $.get, препятсвует множественному выполнению (требуется jQuery)
* post(url, parrams, foo, type, fail) - Декоратор для функции $.post, препятсвует множественному выполнению (требуется jQuery)
* number_format( number, decimals, dec_point, thousands_sep ) - форматирует число, аналог php number_format (decimals по умолчанию 0)
* fmod(a,b) - остаток от деления дробных чисел
* count_char_after_dot(f) - количество знаков после запятой
* noScreening(obj) - убирает экранирование html тегов
* array_unique(arr) - массив без повторяющихся значений
* in_array(needle, haystack, strict) - аналог php функции
* decl(count, one, two, five) - возвращает слово в нужном склонении в зависимости от количества
* getDeclNum(number) - возвращает цифру (1, 2, 5) в зависимости от количества
* getUrlVar() - вернет ассоциативный массив параметров get строки
* getUrlHash() - разбирает хэш адреса на параметры как get строку, возвращает ассоциативный массив
*
*/


(function(my, undefined) {

	//доступные языки
	my.langs = ['ru', 'en'];

	//языковые переменные
	my.lang = {
		ajax_fail: {
			ru: 'Что-то пошло не так, перезагрузите страницу и попробуйте снова',
			en: 'Something went wrong, reload the page and try again'
		}
	};

	//флаг проверки выполнения ajax запросов
	my.ajax = true;

	
	/*
     * Определяет текущий язык сайта (по первой секции url),
	 * если ничего не найдено возвращается первый из доступных языков
	 * 
     * @return {string} - возвращает текущий язык сайта (ru, en)
     */
	my.getLang = function() {
		var path = location.pathname,
			lang = path.split('/');
			
		lang = lang[1];
		
		if (this.in_array(lang, this.langs)) {
			return lang;
		}
		
		//если ничего не найдено первый в списке язык по умолчанию
		return this.langs[0];
	};
	
	/*
     * Возвращает языковую переменную из массива lang, в зависимости от текущего языка сайта
     * 
     * @param {string} name - идентификатор языковой переменной
     * @return {string} - возвращает языкову переменную
     */
	my.getMessage = function(name) {
		var lang = this.getLang(),
			msg = this.lang[name][lang];
		
		return (msg !== undefined) ? msg : '';
	};
	
	/**
	 * Определяет языковую переменную в массив lang
	 * 
	 * @param {Object} object - литерал языковой
	 */
	my.addMessage = function(object) {
		for(var index in object) {
			this.lang[index] = object[index];
		}
	};
	
	/**
	 * Абстракция для всплывающих уведомлений
	 * 
	 * @param {string} text - текст сообщения
	 * @param {string} title - заголовок (по умолчанию "Уведомление")
	 * @param {function} foo - функция вызывается после закрытия всплывающего окна
	 */
	my.alert = function(text, title, foo) {
		foo = foo || function() {};
		title = title || 'Уведомление';

		$('.popup__title').html(title);
		$('.popup__msg').html(text);
		$('.popup').fadeIn(300);

		$('.popup__cross, .popup__bg').unbind('click').on('click', function() {
			$('.popup').fadeOut(300, function() {
				foo();
			});
		});
	};
	
	
	/*
     * Декоратор для функции $.get, препятсвует множественному выполнению
     * 
     * @param {string} url - адрес обработчика
     * @param {string} foo - функция выполняется при положительном обращении к обработчику
     * @param {string} type - тип возвращаемых данных text|json
	 * @param {string} fail - функция выполняется при неудачном обращении к обработчику
     */
	my.get = function(url, foo, type, fail) {
		type = type || 'text';
		fail = fail || function() {
			alert(this.getMessage('ajax_fail'));
		};

		if (my.ajax == true) {
			my.ajax = false;
			
			$.get(url, function(data) {
				my.ajax = true;
				if (foo !== undefined) foo(data);
			}, type).fail(function() {
				my.ajax = true;
				if (fail !== undefined) fail();
			});
		}
	};
	
	/*
     * Декоратор для функции $.post, препятсвует множественному выполнению
     * 
     * @param {string} url - адрес обработчика
     * @param {Array} parrams - массив параметров
     * @param {string} foo - функция выполняется при положительном обращении к обработчику
     * @param {string} type - тип возвращаемых данных text|json
	 * @param {string} fail - функция выполняется при неудачном обращении к обработчику
     */
	my.post = function(url, parrams, foo, type, fail) {
		type = type || 'text';
		fail = fail || function() {
			alert(this.getMessage('ajax_fail'));
		};

		if (my.ajax == true) {
			my.ajax = false;
			
			$.post(url, parrams, function(data) {
				my.ajax = true;
				if (foo !== undefined) foo(data);
			}, type).fail(function() {
				my.ajax = true;
				if (fail !== undefined) fail();
			});
		}
	};

	/*
     * Функция форматитрования числа, аналог php функции
     * 
     * @param {number} number - исходное число
     * @param {number} decimals - устанавливает число знаков после запятой
     * @param {number} dec_point - устанавливает разделитель дробной части
     * @param {number} thousands_sep - устанавливает разделитель тысяч
     * @return {string} - возвращает отформатированное число
     */
	my.number_format = function ( number, decimals, dec_point, thousands_sep ) {  // Format a number with grouped thousands
		//
		// +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
		// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +     bugfix by: Michael White (http://crestidg.com)

		var i, j, kw, kd, km, minus = "";
		
		//для отрицательных чисел
		if(number < 0){
			minus = "-";
			number = number*-1;
		}
		
		// input sanitation & defaults
		if( isNaN(decimals = Math.abs(decimals)) ){
			decimals = 0;
		}
		
		dec_point = dec_point || ".";
		thousands_sep = thousands_sep || " ";
		
		i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

		if( (j = i.length) > 3 ){
			j = j % 3;
		} else{
			j = 0;
		}

		km = (j ? i.substr(0, j) + thousands_sep : "");
		kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
		//kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
		kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");

		return minus + km + kw + kd;
	};



	/*
     * остаток от деления для дробных чисел
     * 
     * @param {number} a - делимое
     * @param {number} b - делитель
     * @return {number} остаток от деления
     */
	my.fmod = function(a, b) {
		var m;
        m = this.count_char_after_dot(a) > this.count_char_after_dot(b) ? this.count_char_after_dot(a) : this.count_char_after_dot(b);

        var d = Math.pow(10, m);
        a *= d;
        b *= d;

        return (a - Math.floor(a / b) * b) / d;
	};
	
	/*
     * вспомогательная функция для функции - остаток от деления для дробных чисел
     * 
     * @param {number} f - число
     * @return {number} количество знаков после запятой
     */
    my.count_char_after_dot = function(f) {
        var c = 0;

        while ((f - Math.floor(f)) != 0) {
            c++;
            f *= 10;
        }
        return c;
    };
	
	/*
     * уберет экранирование html тегов
     * 
     * @param {jQuery} obj - в каком теге применить функцию
     * @param {string} html без экранированных символов
     */
	my.noScreening = function (obj) {
		if (obj.length > 0) {
			var str = obj.html(),
				i = 0, j = 0, tmp = '', ch;
			str = str.replace(RegExp("&lt;", 'g'), '<').replace(RegExp("&gt;", 'g'), '>').replace(RegExp("&amp;", 'g'), '&').replace(RegExp("&quot;", 'g'), '"');

//		.replace(RegExp("»",'g'),'"').replace(RegExp("«",'g'),'"')

			obj.html(str);
		}
	};
	
	/*
     * возвращает массив без повторяющихся значений
     * 
     * @param {Array} arr - массив
	 * @return {Array} - массив
     */
	my.array_unique = function(arr) {
		var sorter = {};
		for (var i=0, j=arr.length; i<j; i++) {
			sorter[arr[i]] = arr[i];
		}
		arr = [];
		for (var i in sorter) {
			arr.push(i);
		}
		return arr;
	};
	
	
	/*
	 * проверяет значение на нахождение в массиве
	 * 
	 * @param {mixed} needle - значение, которое ищем
	 * @param {Array} haystack - массив значений в котором ищем
	 * @param {bool} strict - если true использует строгое сравенение
	 * @return {bool}
	 */
	my.in_array = function (needle, haystack, strict) {
		strict = strict || false;
	
		for (var i = 0, l = haystack.length; i < l; i++) {
			if (strict == false) {
				if (haystack[i] == needle) return true;
			} else {
				if (haystack[i] === needle) return true;
			}
		}
		return false;
	};
	
	/*
     * возвращает слово в нужном склонении в зависимости от количества
     * 
     * @param {number} count - количество объектов
     * @param {string} one - склонение слово при единице
     * @param {string} two - склонение слово при паре
     * @param {string} five - склонение слово при пяти элементах
	 * @return {string} слово в нужном склонении
     */
	my.decl = function (count, one, two, five) {
		var mas = {1: one, 2: two, 5: five};
		return mas[this.getDeclNum(count)];
	};

	/*
     * возвращает цифру (1, 2, 5) в зависимости от количества
     * 
     * @param {number} number - количество объектов
	 * @return {number} число 1, 2, 5
     */
	my.getDeclNum = function (number) {
		var n100 = number % 100;
		var n10 = number % 10;
		
		if ((n100 > 10) && (n100 < 20))
			return 5;
		else if (n10 == 1)
			return 1;
		else if ((n10 >= 2) && (n10 <= 4))
			return 2;
		else
			return 5;
	};
	
	/*
	 * возвращает массив со значениями GET параметров
	 * 
	 * @return {Array} - массив
	 */
	my.getUrlVar = function() {
		var tmp = [],     // два вспомагательных
			tmp2 = [],     // массива
			param = [];
		
		var get = location.search;  // строка GET запроса
		if(get != '') {
			tmp = (get.substr(1)).split('&');   // разделяем переменные
			for(var i = 0; i < tmp.length; i++) {
				tmp2 = tmp[i].split('=');       // массив param будет содержать
				param[tmp2[0]] = tmp2[1];       // пары ключ(имя переменной)->значение
			}
		}
		
		return param;
	};

	/*
	 * возвращает массив со значениями HASH параметров
	 * 
	 * @return {Array} - массив
	 */
	my.getUrlHash = function() {
		var tmp = [],     // два вспомагательных
			tmp2 = [],     // массива
			param = [];

		var hash = location.hash;  // строка GET запроса
		if(hash != '') {
			tmp = (hash.substr(1)).split('&');   // разделяем переменные
			for(var i = 0; i < tmp.length; i++) {
				tmp2 = tmp[i].split('=');       // массив param будет содержать
				param[tmp2[0]] = tmp2[1];       // пары ключ(имя переменной)->значение
			}
		}

		return param;
	};
	
})(window.my = window.my || {});