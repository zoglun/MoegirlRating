window.stringFormat = function ( format, args ) {
	var result = format;
	if ( arguments.length === 0 ) {
		return '';
	} else if ( arguments.length === 1 ) {
		return format;
	} else if ( $.isPlainObject( args ) ) {
		result = format;

		for ( var key in args ) {
			if (args[key] !== undefined ) {
				var reg = new RegExp( '{' + key  + '}', 'g' );
				result = result.replace(reg, args[key]);
			}
		}

		return result;

	} else {
		result = format;
		for (var i = 0; i < (arguments.length - 1); i++) {
			if (arguments[ i + 1 ] !== undefined) {
　　　　var arrayReg = new RegExp( '({)' + i + '(})', 'g' );
				result = result.replace( arrayReg, arguments[ i + 1 ] );
			}
		}

		return result;
	}
};


function MoegirlRatingControl( id, wikiId ) {
	this.id = id;
	this.data = {};
	this.clickable = true;
	this.resultTextFormat = '<strong>{0}</strong> 人打分，平均分 <strong>{1}</strong> 分';
	this.ratingSuccessText = '打分成功';
	this.cannotLoadResultErrorText = '错误，无法加载打分结果';
	this.wikiId = wikiId;
}

window.MoegirlRatingControl = MoegirlRatingControl;

MoegirlRatingControl.prototype.init =  function() {
	var self = this;
	$.ajax({
		url: '/api.php',
		type: 'GET',
		data: {
			action: 'MRGetTotalRating',
			format: 'json',
			wikiId: this.wikiId
		},
		datatype: 'json'
	})
	.done (function( data ) {
		data = data.MRGetTotalRating;
		if ( !data.isSuccess ) {
			self.showErrorMessage( data.errorMessage );
			return;
		}
		self.clickable = !data.isDuplicated && !data.isAnonymous;

		self.setResult( data.totalUsers, data.totalScore );
		self.setScore( data.totalScore );
		$( '.rating_body li a', self.id ).click( function( event ) {
			self.ratingClick( event );
		});

	})
	.fail(function() {
	 self.showErrorMessage( self.cannotLoadResultErrorText );
	});
};

MoegirlRatingControl.prototype.showErrorMessage = function( errorMessage ) {
	this.clickable = false;
	this.setResultIcon( 'error' );
	$( '.result_text', this.id ).text( errorMessage );
};

MoegirlRatingControl.prototype.ratingClick = function( event ) {
	if ( !this.clickable ) {
		// can't click
	} else {
		ratingScore = parseInt($(event.target).text(), 10);
		ratingScore = this.correctScore(ratingScore);
		this.clickable = false;

		this.enterLoadState();

		var self = this;
		$.ajax({
			url: 'rating.php',
			type: 'POST',
			data: {
				score : ratingScore,
				action  : "rate"
			},
			success: function( data ) {
				if ( !data.isSuccess ) {
					self.showErrorMessage( data.errorMessage );
					return;
				}

				self.showSuccessMessage();

				// wait a while after show the "Success" message.
				setTimeout(function() {
					self.setResult( data.totalUsers, data.totalScore );
				    self.setScore( data.totalScore );
				}, 1500);
			}
		})
		.fail(function() {
			self.showErrorMessage( self.cannotLoadResultErrorText );
		});
	}
};

MoegirlRatingControl.prototype.showSuccessMessage = function() {
	this.setResultIcon( 'success' );
	$( '.result_text', this.id ).text( this.ratingSuccessText );
};

MoegirlRatingControl.prototype.enterLoadState = function() {
		$( '.rating_main', this.id ).addClass( 'rating_body_disabled' ).removeClass( 'rating_body' );
		$( '.rating_body_result', this.id ).width(0);
		this.setResultIcon( 'loading' );
		$( '.result_text', this.id ).html( '' );
};

MoegirlRatingControl.prototype.setResult = function( users, score ) {
	var resultText = stringFormat( this.resultTextFormat, users, score );
	this.setResultIcon( 'normal' );
	$( '.result_text', this.id ).html( resultText );
};

MoegirlRatingControl.prototype.setScore = function( score ) {
	if ( this.clickable ) {
		$( '.rating_main', this.id ).addClass( 'rating_body' ).removeClass( 'rating_body_disabled' );
	} else {
		$( '.rating_main', this.id ).addClass( 'rating_body_disabled' ).removeClass( 'rating_body' );
	}

	score = this.correctScore(score);
	$( '.rating_body_result', this.id ).width( ( score / 5 ) * 150 );
};

MoegirlRatingControl.prototype.correctScore = function( score ) {
	if ( score < 0 ) {
		return 0;
	} else if ( score > 5 ) {
		return 5;
	} else {
		return score;
	}
};



/**
 * Set the icon before the result text
 *
 * @param { string } type the type of the icon. The type contain 'success',
 * 'error', 'loading' and 'normal'
 *
 * @return { void }
 *
 */
MoegirlRatingControl.prototype.setResultIcon = function( type ) {
	var $resultIcon = $( '.result_icon' );
	if ( type === 'success' ) {
		$resultIcon.removeClass( 'loading error' ).addClass( 'success' ).show();
	} else if ( type === 'error' ) {
		$resultIcon.removeClass( 'success loading' ).addClass( 'error' ).show();
	} else if ( type === 'loading' ) {
		$resultIcon.removeClass( 'success error' ).addClass( 'loading' ).show();
	} else {
		$resultIcon.removeClass( 'success error loading' ).hide();
	}
};
