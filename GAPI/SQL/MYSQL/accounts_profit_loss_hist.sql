-- [GetList]
select
	  accounts_profit_loss_hist_no
	, accounts_profit_loss_no
	, settlement_date
	, theater_price
	, etc_price
	, use_yn
	, del_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
	, fn_get_user_name_by_no(insert_user_no) as insert_user_no_name
	, fn_get_user_name_by_no(update_user_no) as update_user_no_name
from accounts_profit_loss_hist
where 1=1
and use_yn = 'Y'
and del_yn = 'N'
and accounts_profit_loss_no = :accounts_profit_loss_no
order by settlement_date desc;

-- [Insert]
insert into accounts_profit_loss_hist(
	  accounts_profit_loss_hist_no
	, accounts_profit_loss_no
	, settlement_date
	, theater_price
	, etc_price
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :accounts_profit_loss_hist_no
	, :accounts_profit_loss_no
	, :settlement_date
	, :theater_price
	, :etc_price
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update accounts_profit_loss_hist set
	  accounts_profit_loss_hist_no	= :accounts_profit_loss_hist_no
	, accounts_profit_loss_no		= :accounts_profit_loss_no
	, settlement_date				= :settlement_date
	, theater_price					= :theater_price
	, etc_price						= :etc_price
	, update_user_no				= :oper_user_no
	, update_date					= current_timestamp
where accounts_profit_loss_hist_no = :accounts_profit_loss_hist_no
;

-- [Delete]
update accounts_profit_loss_hist set
	  use_yn		= 'N'
	, del_yn		= 'Y'
	, delete_user_no	= :oper_user_no
	, delete_date		= current_timestamp
where accounts_profit_loss_hist_no = :accounts_profit_loss_hist_no
;
