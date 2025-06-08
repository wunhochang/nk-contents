-- [GetList]
select
     cp_pre_pay_no
	, cp_corp_detail_no
	, cp_corp_no
	, settlement_month 
	, DATE_FORMAT(prepay_date, "%Y-%m-%d") as prepay_date
	, settlement_amt
	, remark
	, use_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
from cp_pre_pay
where 1=1 
	and del_yn = 'N' 
	and use_yn = 'Y' 
	and cp_corp_no = :cp_corp_no
	and cp_corp_detail_no = :cp_corp_detail_no
	and pay_yn='Y'
order by prepay_date desc
;


-- [Insert]
insert into cp_pre_pay(
      cp_pre_pay_no
	, cp_corp_detail_no
	, cp_corp_no
	, settlement_month
	, prepay_date
	, settlement_amt
	, remark
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
      :cp_pre_pay_no
	,:cp_corp_detail_no
	, :cp_corp_no
	, SUBSTRING(:prepay_date,1,7)
    , DATE_FORMAT(:prepay_date, '%Y-%m-%d')
	, :settlement_amt
	, :remark
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update cp_pre_pay set
	  cp_corp_no			= :cp_corp_no              
	, cp_corp_detail_no  	= :cp_corp_detail_no
	, prepay_date			= DATE_FORMAT(:prepay_date, '%Y-%m-%d')
	, settlement_month		= SUBSTRING(:prepay_date,1,7)  
	, settlement_amt		= :settlement_amt        
	, remark		        = :remark          
	, use_yn				= :use_yn   
	, update_user_no		= :oper_user_no            
	, update_date			= current_timestamp 
where cp_pre_pay_no = :cp_pre_pay_no
;


-- [CpPrePayConfirm]
insert into cp_pre_pay(
      cp_pre_pay_no
	, cp_corp_detail_no
	, cp_corp_no
	, settlement_month
	, prepay_date
	, settlement_amt
	, remark
    , pay_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
      :cp_pre_pay_no
	,:cp_corp_detail_no
	, :cp_corp_no
	, :settlement_month
    , DATE_FORMAT(:prepay_date, '%Y-%m-%d')
	, :settlement_amt
	, :remark
    , 'N'
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [CpPrePayCancel]
update cp_pre_pay set
	    use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where cp_corp_no = :cp_corp_no and cp_corp_detail_no = :cp_corp_detail_no and settlement_month = :settlement_date
;

-- [MailSendLog]
insert into mail_send_log(
      mail_send_log_no
	, mail_title
	, to_email
	, cc_email
	, attach_file
	, settlement_month
	, remark
	, send_date
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
      :mail_send_log_no
	,:mail_title
	, :to_email
	, :cc_email
    , :attach_file
	, :st_date
	, :remark
	, current_timestamp
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);


-- [Delete]
update cp_corp_detail set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where cp_corp_detail_no = :cp_corp_detail_no
;