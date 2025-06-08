-- [GetTop1List]
select
	   accounting_end_date_no
	 , end_date
	, gubun
from accounting_end_date
where use_yn='Y'
	and del_yn = 'N'
	and gubun = :gubun
order by end_date desc
limit 1;

-- [check_end_date]
select
	   accounting_end_date_no
	 , end_date
	, gubun
from accounting_end_date
where use_yn='Y'
	and del_yn = 'N'
	and gubun = :gubun
	and end_date = :end_date;

-- [Insert]
insert into accounting_end_date(
	  accounting_end_date_no
	, end_date
	, gubun
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	:accounting_end_date_no
	, :end_date
	, :gubun
	, :oper_user_no
	, sysdate()
	, :oper_user_no
	, sysdate()
);

-- [Delete]
update accounting_end_date set
	use_yn = 'N'
	, del_yn = 'Y'
	, delete_user_no = :oper_user_no
	, delete_date = sysdate()
where end_date = :end_date
	and gubun = :gubun;
