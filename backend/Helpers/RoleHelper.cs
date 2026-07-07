namespace backend.Helpers
{
    public static class RoleHelper
    {
        public const int Student = 1;
        public const int VisitingTeacher = 2;
        public const int Teacher = 10;
        public const int DeptHead = 20;
        public const int Dean = 50;
        public const int Admin = 99;

        public static string GetRoleName(int roleId)
        {
            return roleId switch
            {
                Student => "Sinh Viên",
                VisitingTeacher => "Giáo Viên Thỉnh Giảng",
                Teacher => "Giáo Viên",
                DeptHead => "Trưởng Bộ Môn",
                Dean => "Trưởng Khoa",
                Admin => "Admin",
                _ => "Unknown"
            };
        }
    }
}
