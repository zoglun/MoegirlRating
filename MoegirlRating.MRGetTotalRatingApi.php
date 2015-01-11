<?php
class MRGetTotalRatingApi extends ApiBase {
	public $logger;

	public function __construct(ApiMain $mainModule, $moduleName, $modulePrefix= '') {
		parent::__construct( $mainModule, $moduleName, $modulePrefix );
		$this->logger = new MRLogging( __FILE__ );
	}


	public function execute() {
		$ratingId = 0;
		$user = $this->getUser();

		if (!isset( $user )) {
			$this->logger->debug( __LINE__, "Can't get user" );
			throw new Exception( 'Can\'t get user' );
		}

		$wikiId = (int)$this->getMain()->getVal('wikiId');
		if (!is_int( $wikiId )) {
			$this->logger->error( __LINE__, 'wikiId 格式不正确' );
			$this->getResult()->addValue( null, $this->getModuleName(), array(
					'isSuccess' => false,
					'message' => 'wikiId 格式不正确'
					));	
			return true;
		}

		$ratingController = new RatingController( $ratingId, $wikiId, $user, $this->getRequest()->getIP() );

		try {
			$result = $ratingController->getScore();

			$this->getResult()->addValue( null, $this->getModuleName(), $result );

		} catch (Exception $ex) {

			$this->logger->error( __LINE__, 'Cannot get the rating score, wikiId %d', $wikiId );

			$this->getResult()->addValue( null, $this->getModuleName(), array(
					'isSuccess' => false,
					'message' => '服务器错误，请稍后再试'
					));
		}

		return true;
	}

	public function getDescription() {
		return 'Get the rating average score and total rating users';
	}

	public function getAllowedParams() {
		return array_merge( array(), array(
			'wikiId' => array (
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true
			)));
	}

	public function getParamDescription() {
	}

	public function getExample() {
	}
}

