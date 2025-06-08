-- [Insert]
insert into sales_kind(
	  sp_corp_detail_no
	, sales_kind
)
values(
	  :sp_corp_detail_no
	, :sales_kind
);

-- [Delete]
delete from sales_kind
where sp_corp_detail_no = :sp_corp_detail_no;
